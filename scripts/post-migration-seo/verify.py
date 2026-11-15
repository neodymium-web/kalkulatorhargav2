#!/usr/bin/env python3
"""Read-only GET audit. No Google submission, authentication bypass or platform writes."""
import argparse
import concurrent.futures
import datetime
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titles, self.h1, self.canonical, self.descriptions, self.robots = [], [], [], [], []
        self.links, self.schema, self.schema_errors = [], [], []
        self.active_title = self.active_h1 = self.active_link = self.active_schema = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title': self.active_title = ''
        if tag == 'h1': self.active_h1 = ''
        if tag == 'a' and a.get('href'): self.active_link = [a['href'], '']
        if tag == 'link' and 'canonical' in a.get('rel', '').lower().split(): self.canonical.append(a.get('href', ''))
        if tag == 'meta':
            if a.get('name', '').lower() == 'description': self.descriptions.append(a.get('content', ''))
            if a.get('name', '').lower() in ['robots', 'googlebot']: self.robots.append(a.get('content', ''))
        if tag == 'script' and a.get('type', '').lower() == 'application/ld+json': self.active_schema = ''

    def handle_data(self, data):
        if self.active_title is not None: self.active_title += data
        if self.active_h1 is not None: self.active_h1 += data
        if self.active_link is not None: self.active_link[1] += data
        if self.active_schema is not None: self.active_schema += data

    def handle_endtag(self, tag):
        if tag == 'title' and self.active_title is not None:
            self.titles.append(' '.join(self.active_title.split())); self.active_title = None
        if tag == 'h1' and self.active_h1 is not None:
            self.h1.append(' '.join(self.active_h1.split())); self.active_h1 = None
        if tag == 'a' and self.active_link is not None:
            self.links.append({'href': self.active_link[0], 'text': ' '.join(self.active_link[1].split())}); self.active_link = None
        if tag == 'script' and self.active_schema is not None:
            try: self.schema.append(json.loads(self.active_schema))
            except ValueError as error: self.schema_errors.append(str(error))
            self.active_schema = None


def schema_types(value):
    result = set()
    if isinstance(value, dict):
        t = value.get('@type', [])
        result.update([t] if isinstance(t, str) else t)
        for child in value.values(): result.update(schema_types(child))
    elif isinstance(value, list):
        for child in value: result.update(schema_types(child))
    return result


def normalized(url):
    p = urlsplit(url)
    return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path or '/', p.query, p.fragment))


def has_noindex(meta, headers):
    return bool(re.search(r'\b(noindex|none)\b', ','.join(meta + [headers.get('x-robots-tag', '')]), re.I))


def request(url, agent='KalkulatorHargaPostMigrationAudit/1.0'):
    with tempfile.TemporaryDirectory() as d:
        headers, body = Path(d) / 'headers', Path(d) / 'body'
        r = subprocess.run(['curl', '--silent', '--show-error', '--globoff', '--connect-timeout', '10', '--max-time', '25', '--max-filesize', '4000000', '--user-agent', agent, '--dump-header', str(headers), '--output', str(body), '--write-out', '%{http_code}\n%{ssl_verify_result}\n%{time_total}', url], capture_output=True, text=True)
        if r.returncode: return {'url': url, 'error': r.stderr.strip(), 'curlExit': r.returncode}, ''
        blocks = [b for b in re.split(r'\n\s*\n', headers.read_text()) if b.startswith('HTTP/')]
        parsed = {}
        for line in blocks[-1].splitlines()[1:]:
            if ':' in line:
                k, v = line.split(':', 1); k = k.lower()
                parsed[k] = (parsed[k] + ', ' if k in parsed else '') + v.strip()
        payload = body.read_bytes(); metrics = r.stdout.splitlines()
        return {'url': url, 'status': int(metrics[0]), 'tlsVerifyResult': int(metrics[1]), 'seconds': float(metrics[2]), 'headers': parsed, 'bodySha256': hashlib.sha256(payload).hexdigest()}, payload.decode('utf-8', errors='replace')


def chain(url, allowed_hosts, agent=None):
    hops, seen, html = [], set(), ''
    for _ in range(6):
        if url in seen: return hops, html, 'REDIRECT_LOOP'
        if urlsplit(url).netloc not in allowed_hosts: return hops, html, 'EXTERNAL_REDIRECT'
        seen.add(url)
        response, html = request(url, agent) if agent else request(url)
        hops.append(response)
        if response.get('error'): return hops, html, 'NETWORK_ERROR'
        if response['status'] not in [301, 302, 303, 307, 308]: return hops, html, None
        location = response['headers'].get('location')
        if not location: return hops, html, 'REDIRECT_WITHOUT_LOCATION'
        url = urljoin(url, location)
    return hops, html, 'TOO_MANY_REDIRECTS'


def validate(row, page, hops, origin, mode, robots_allowed=True):
    errors = []
    if not hops or hops[-1].get('status') != row['status']: errors.append('HTTP_STATUS')
    if len(hops) != 1: errors.append('UNEXPECTED_REDIRECT')
    if len(page.titles) != 1 or not page.titles[0]: errors.append('TITLE')
    if len(page.h1) != 1 or not page.h1[0]: errors.append('H1')
    if len(page.descriptions) != 1 or not page.descriptions[0]: errors.append('DESCRIPTION')
    expected = origin.rstrip('/') + (row['canonicalPath'] if row['canonicalPath'] != '/' else '')
    if len(page.canonical) != 1 or normalized(page.canonical[0]) != normalized(expected): errors.append('CANONICAL')
    noindex = has_noindex(page.robots, hops[-1].get('headers', {}) if hops else {})
    expected_noindex = mode == 'staging' or row['indexPolicy'] == 'noindex'
    if noindex != expected_noindex: errors.append('INDEXABILITY')
    if mode == 'production' and row['indexPolicy'] != 'noindex' and not robots_allowed: errors.append('ROBOTS_BLOCKED')
    if page.schema_errors: errors.append('JSON_LD_PARSE')
    return errors


def parse_sitemap(text):
    return [node.text for node in ET.fromstring(text).iter() if node.tag.rsplit('}', 1)[-1] == 'loc']


def sitemap_errors(actual, expected):
    normalized_actual = [normalized(u) for u in actual]
    errors = []
    if len(set(normalized_actual)) != len(normalized_actual): errors.append('DUPLICATE_SITEMAP_URL')
    if set(normalized_actual) != {normalized(u) for u in expected}: errors.append('SITEMAP_MEMBERSHIP')
    return errors


def inbound_links(pages, origin, target):
    result = []
    for page in pages:
        if page['path'] == target: continue
        for link in page['links']:
            url = urlsplit(urljoin(origin + page['path'], link['href']))
            if url.scheme in ['http', 'https'] and url.netloc == urlsplit(origin).netloc and url.path == target:
                result.append({'source': page['path'], 'anchor': link['text']})
    return result


def run(args):
    inventory = json.loads(Path(args.inventory).read_text())
    origin = args.origin.rstrip('/'); parsed_origin = urlsplit(origin)
    if parsed_origin.scheme not in ['http', 'https'] or parsed_origin.path or parsed_origin.query: raise ValueError('Origin must be an HTTP(S) origin without a path/query')
    canonical_origin = args.canonical_origin.rstrip('/') if args.canonical_origin else (inventory['productionOrigin'] if args.mode == 'production' else 'https://kalkulatorharga.com')
    for r in inventory['rows']:
        if not r['path'].startswith('/') or r['path'].startswith('//') or any(c in r['path'] for c in ['?', '#']): raise ValueError('Invalid inventory path')
    hosts = {parsed_origin.netloc}; findings = []
    robot_response, robot_text = request(origin + '/robots.txt')
    sitemap_response, sitemap_text = request(origin + '/sitemap.xml')
    robots = RobotFileParser(); robots.parse(robot_text.splitlines())
    if robot_response.get('status') != 200: findings.append({'path': '/robots.txt', 'errors': ['ROBOTS_HTTP']})
    if sitemap_response.get('status') != 200: findings.append({'path': '/sitemap.xml', 'errors': ['SITEMAP_HTTP']})
    try: actual_sitemap = parse_sitemap(sitemap_text)
    except ET.ParseError: actual_sitemap = []; findings.append({'path': '/sitemap.xml', 'errors': ['SITEMAP_XML']})
    expected_sitemap = [canonical_origin + (r['path'] if r['path'] != '/' else '') for r in inventory['rows'] if r['sitemap'] or (args.mode == 'staging' and r['family'] == 'legacy')]
    errors = sitemap_errors(actual_sitemap, expected_sitemap)
    if errors: findings.append({'path': '/sitemap.xml', 'errors': errors})
    if args.mode == 'production' and canonical_origin + '/sitemap.xml' not in (robots.site_maps() or []): findings.append({'path': '/robots.txt', 'errors': ['ROBOTS_SITEMAP']})
    if args.mode == 'staging' and robots.can_fetch('Googlebot', origin + '/'): findings.append({'path': '/robots.txt', 'errors': ['STAGING_CRAWL_ALLOWED']})

    def inspect(row):
        hops, html, error = chain(origin + row['path'], hosts)
        page = Page(); page.feed(html)
        allowed = robots.can_fetch('Googlebot', origin + row['path'])
        errors = validate(row, page, hops, canonical_origin, args.mode, allowed)
        if error: errors.append(error)
        return {**row, 'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'hops': hops, 'title': page.titles, 'description': page.descriptions, 'h1': page.h1, 'canonical': page.canonical, 'metaRobots': page.robots, 'robotsAllowsGooglebot': allowed, 'schemaTypes': sorted(schema_types(page.schema)), 'schema': page.schema if row['path'] in inventory['criticalPaths'] else None, 'links': page.links, 'errors': errors}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: pages = list(pool.map(inspect, inventory['rows']))
    for p in pages:
        if p['errors']: findings.append({'path': p['path'], 'errors': p['errors']})
    eligible = {p['path']: p for p in pages if p['sitemap']}
    seen, queue = set(), ['/']
    while queue:
        p = queue.pop(0)
        if p in seen or p not in eligible: continue
        seen.add(p)
        for a in eligible[p]['links']:
            u = urlsplit(urljoin(origin + p, a['href']))
            if u.netloc == parsed_origin.netloc and u.path in eligible and u.path not in seen: queue.append(u.path)
    unreachable = sorted(set(eligible) - seen)
    if unreachable: findings.append({'path': '/', 'errors': ['SSR_ORPHAN'], 'routes': unreachable})
    titles = {}
    for p in eligible.values():
        if p['title']: titles.setdefault(p['title'][0], []).append(p['path'])
    duplicate_titles = {t: paths for t, paths in titles.items() if len(paths) > 1}
    if duplicate_titles: findings.append({'path': '/', 'errors': ['DUPLICATE_TITLE'], 'duplicates': duplicate_titles})
    controls = []
    missing, _, error = chain(origin + '/kalkulator/seo-audit-route-that-does-not-exist', hosts)
    controls.append({'name': 'unknown-route', 'hops': missing, 'error': error})
    if error or not missing or missing[-1].get('status') != 404: findings.append({'path': '/kalkulator/seo-audit-route-that-does-not-exist', 'errors': ['SOFT_404_CONTROL']})
    if args.mode == 'production':
        apex = 'kalkulatorharga.com'; apex_origin = 'https://' + apex
        for p in ['/', *inventory['criticalPaths']]:
            hops, _, error = chain(apex_origin + p + '?seo_probe=preserved', hosts | {apex})
            ok = not error and len(hops) == 2 and hops[0].get('status') == 308 and hops[-1].get('status') == 200 and hops[-1]['url'] == origin + p + '?seo_probe=preserved'
            controls.append({'name': 'apex', 'path': p, 'hops': hops, 'pass': ok})
            if not ok: findings.append({'path': p, 'errors': ['APEX_REDIRECT']})
    hpp_inbound = inbound_links(eligible.values(), origin, '/kalkulator/hpp')
    result = {'schemaVersion': 1, 'retrievedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'inventorySourceSHA': inventory['sourceSHA'], 'origin': origin, 'canonicalOrigin': canonical_origin, 'mode': args.mode, 'method': 'curl GET, TLS verification on, manual redirect capture, SSR HTML only; not a Googlebot-IP fetch or Google indexing test', 'robots': {**robot_response, 'body': robot_text}, 'sitemap': {**sitemap_response, 'urls': actual_sitemap}, 'summary': {'pages': len(pages), 'eligible': len(eligible), 'expectedSitemap': len(expected_sitemap), 'actualSitemap': len(actual_sitemap), 'reachableWithoutJSOrPendingArchives': len(seen), 'hppInbound': len(hpp_inbound), 'findings': len(findings)}, 'findings': findings, 'hppInbound': hpp_inbound, 'controls': controls, 'pages': pages}
    output = Path(args.output); output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'output': str(output), **result['summary'], 'findings': findings}))
    return 1 if findings else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', default='test-results/post-migration-seo/inventory.json')
    parser.add_argument('--origin', default='https://www.kalkulatorharga.com')
    parser.add_argument('--canonical-origin')
    parser.add_argument('--mode', choices=['production', 'staging'], default='production')
    parser.add_argument('--output', default='test-results/post-migration-seo/verification.json')
    raise SystemExit(run(parser.parse_args()))
