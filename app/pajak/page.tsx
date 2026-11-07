import {CategoryPage} from '../../components/category-page'
import {pageMetadata} from '../../lib/seo'
export const metadata=pageMetadata('Kalkulator Pajak: PPN, PPh dan Gross-up','Estimasi pajak dalam cakupan sumber primer, tanggal berlaku dan kelayakan; simulasi manual dibedakan dari ketentuan hukum.','/pajak')
export default function Pajak(){return <CategoryPage categoryId="pajak" title="Kalkulator pajak" description="Tinjau PPN, PPh23, sewa tanah/bangunan, gross-up manual dan UMKM PP20/2026 dengan sumber serta batas kelayakan. Hasil bukan penetapan DJP atau nasihat hukum."/>}
