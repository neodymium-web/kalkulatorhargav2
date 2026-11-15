import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('verify', Path(__file__).with_name('verify.py'))
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)

ORIGIN = 'https://www.kalkulatorharga.com'
HTML = '<title>HPP &amp; biaya</title><meta name="description" content="Biaya produksi"><link href="https://www.kalkulatorharga.com/kalkulator/hpp" rel="canonical"><h1>Hitung <span>HPP</span></h1><a href="/bisnis">Bisnis</a>'
ROW = {'path': '/kalkulator/hpp', 'canonicalPath': '/kalkulator/hpp', 'status': 200, 'indexPolicy': 'indexable'}
HOPS = [{'status': 200, 'headers': {}}]


class AuditTests(unittest.TestCase):
    def page(self, html=HTML):
        page = verify.Page(); page.feed(html); return page

    def test_reads_nested_headings_entities_and_links(self):
        page = self.page()
        self.assertEqual(page.titles, ['HPP & biaya'])
        self.assertEqual(page.h1, ['Hitung HPP'])
        self.assertEqual(page.links, [{'href': '/bisnis', 'text': 'Bisnis'}])
        self.assertEqual(verify.validate(ROW, page, HOPS, ORIGIN, 'production'), [])

    def test_rejects_wrong_host_duplicate_canonical_and_404(self):
        page = self.page(HTML.replace('https://www.', 'https://'))
        self.assertIn('CANONICAL', verify.validate(ROW, page, HOPS, ORIGIN, 'production'))
        page = self.page(HTML + '<link rel="canonical" href="https://www.kalkulatorharga.com/">')
        self.assertIn('CANONICAL', verify.validate(ROW, page, HOPS, ORIGIN, 'production'))
        self.assertIn('HTTP_STATUS', verify.validate(ROW, self.page(), [{'status': 404}], ORIGIN, 'production'))

    def test_detects_meta_and_header_noindex_without_overriding_pending_policy(self):
        for directives in ['noindex, follow', 'none', 'NOINDEX']:
            page = self.page(HTML + f'<meta name="robots" content="{directives}">')
            self.assertIn('INDEXABILITY', verify.validate(ROW, page, HOPS, ORIGIN, 'production'))
            self.assertNotIn('INDEXABILITY', verify.validate({**ROW, 'indexPolicy': 'noindex'}, page, HOPS, ORIGIN, 'production'))
        hops = [{'status': 200, 'headers': {'x-robots-tag': 'googlebot: noindex'}}]
        self.assertIn('INDEXABILITY', verify.validate(ROW, self.page(), hops, ORIGIN, 'production'))
        self.assertIn('INDEXABILITY', verify.validate(ROW, self.page(), HOPS, ORIGIN, 'staging'))

    def test_detects_heading_title_description_and_robot_regressions(self):
        page = self.page(HTML + '<h1>Second</h1>')
        self.assertIn('H1', verify.validate(ROW, page, HOPS, ORIGIN, 'production'))
        self.assertIn('TITLE', verify.validate(ROW, self.page(HTML.replace('<title>HPP &amp; biaya</title>', '')), HOPS, ORIGIN, 'production'))
        self.assertIn('DESCRIPTION', verify.validate(ROW, self.page(HTML.replace('content="Biaya produksi"', 'content=""')), HOPS, ORIGIN, 'production'))
        self.assertIn('ROBOTS_BLOCKED', verify.validate(ROW, self.page(), HOPS, ORIGIN, 'production', False))

    def test_root_alias_normalization_does_not_ignore_query_or_host_conflicts(self):
        self.assertEqual(verify.normalized(ORIGIN), verify.normalized(ORIGIN + '/'))
        self.assertNotEqual(verify.normalized(ORIGIN), verify.normalized(ORIGIN + '/?other=1'))
        self.assertNotEqual(verify.normalized(ORIGIN), verify.normalized('https://kalkulatorharga.com'))

    def test_sitemap_set_checks_membership_duplicates_and_namespaced_xml(self):
        urls = verify.parse_sitemap('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.kalkulatorharga.com/</loc></url></urlset>')
        self.assertEqual(verify.sitemap_errors(urls, [ORIGIN]), [])
        self.assertIn('DUPLICATE_SITEMAP_URL', verify.sitemap_errors(urls * 2, [ORIGIN]))
        self.assertIn('SITEMAP_MEMBERSHIP', verify.sitemap_errors(urls, [ORIGIN + '/kalkulator/hpp']))

    def test_schema_reads_graph_but_does_not_treat_script_text_as_markup(self):
        page = self.page(HTML + '<script type="application/ld+json">{"@graph":[{"@type":"WebApplication"}]}</script><script>"<h1>not a heading</h1>"</script>')
        self.assertEqual(verify.schema_types(page.schema), {'WebApplication'})
        self.assertEqual(page.h1, ['Hitung HPP'])
        page = self.page(HTML + '<script type="application/ld+json">{broken}</script>')
        self.assertIn('JSON_LD_PARSE', verify.validate(ROW, page, HOPS, ORIGIN, 'production'))

    def test_records_redirect_chain_and_never_follows_external_host(self):
        responses = [({'status': 308, 'headers': {'location': ORIGIN + '/kalkulator/hpp?x=1'}}, ''), ({'status': 200, 'headers': {}}, HTML)]
        with patch.object(verify, 'request', side_effect=responses):
            hops, _, error = verify.chain('https://kalkulatorharga.com/kalkulator/hpp?x=1', {'kalkulatorharga.com', 'www.kalkulatorharga.com'})
        self.assertIsNone(error); self.assertEqual([h['status'] for h in hops], [308, 200])
        self.assertIn('UNEXPECTED_REDIRECT', verify.validate(ROW, self.page(), hops, ORIGIN, 'production'))
        with patch.object(verify, 'request', return_value=({'status': 302, 'headers': {'location': 'https://unrelated.example/login'}}, '')) as request:
            _, _, error = verify.chain(ORIGIN, {'www.kalkulatorharga.com'})
        self.assertEqual(error, 'EXTERNAL_REDIRECT'); self.assertEqual(request.call_count, 1)

    def test_network_failure_and_redirect_loop_are_not_success(self):
        with patch.object(verify, 'request', return_value=({'error': 'DNS failed'}, '')):
            _, _, error = verify.chain(ORIGIN, {'www.kalkulatorharga.com'})
        self.assertEqual(error, 'NETWORK_ERROR')
        with patch.object(verify, 'request', return_value=({'status': 308, 'headers': {'location': ORIGIN}}, '')):
            _, _, error = verify.chain(ORIGIN, {'www.kalkulatorharga.com'})
        self.assertEqual(error, 'REDIRECT_LOOP')

    def test_inbound_evidence_excludes_self_and_unrelated_origins(self):
        pages = [{'path': '/', 'links': [{'href': '/kalkulator/hpp', 'text': 'HPP'}, {'href': 'https://unrelated.example/kalkulator/hpp', 'text': 'Other'}]}, {'path': '/kalkulator/hpp', 'links': [{'href': '#konten', 'text': 'Skip'}]}]
        self.assertEqual(verify.inbound_links(pages, ORIGIN, '/kalkulator/hpp'), [{'source': '/', 'anchor': 'HPP'}])


if __name__ == '__main__': unittest.main()
