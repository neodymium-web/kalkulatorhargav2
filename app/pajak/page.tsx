import {CategoryPage} from '../../components/category-page'
import {pageMetadata} from '../../lib/seo'
export const metadata=pageMetadata('Kalkulator Pajak: PPN, PPh dan Gross-up','Estimasi pajak dalam cakupan sumber primer, tanggal berlaku dan kelayakan; simulasi manual dibedakan dari ketentuan hukum.','/pajak')
export default function Pajak(){return <CategoryPage categoryId="pajak" title="Kalkulator pajak" description="Sepuluh alat PPN, PPh 21, PPh 23, sewa, UMKM, gross-up, simulasi impor, dan dasar properti DKI 2024. Periksa sumber, masa, wilayah, dan kelayakan; hasil bukan penetapan otoritas."/>}
