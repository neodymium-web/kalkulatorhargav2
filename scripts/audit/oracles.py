"""Independent audit references. No application imports or engine outputs.
Run: python3 scripts/audit/oracles.py; expected values are Fraction/Decimal proofs.
Integer outputs retain each documented display scale (100=cents/basis points, etc.).
"""
from fractions import Fraction as F
from decimal import Decimal, localcontext, ROUND_HALF_UP
from datetime import date, timedelta
import json, math
from pathlib import Path
CASES=[]
def Q(x,scale=1):
 x=F(x)*scale
 return (-1 if x<0 else 1)*((2*abs(x.numerator)+x.denominator)//(2*x.denominator))
def C(x):
 x=F(x);return -(-x.numerator//x.denominator)
def S(obj):
 if isinstance(obj,dict):return {k:S(v) for k,v in obj.items()}
 if isinstance(obj,list):return [S(v) for v in obj]
 return str(obj)
def A(slug,inp,path,expected,proof,edge=None,edge_checks=None,kind='integer'):
 inp=S(inp)
 if edge is None:
  key=next(k for k,v in inp.items() if isinstance(v,str) and v.replace('.','',1).replace('-','',1).isdigit())
  edge={key:'NaN'}
 edge_input={**inp,**S(edge)}
 checks=[{'path':path,'kind':kind,'expected':str(expected)}]
 CASES.append({'slug':slug,'input':inp,'checks':checks,'proof':proof,'edgeInput':edge_input,'edgeChecks':edge_checks or [{'path':'success','kind':'literal','expected':False}]})
def extra(path,value,kind='integer'):
 CASES[-1]['checks'].append({'path':path,'kind':kind,'expected':str(value)})
period={'start':'2024-02-01','end':'2024-02-29'}
A('hpp',dict(materials=843,labor=127,overhead=49,units=7),'perUnit',Q(F(1019,7)),'(843+127+49)/7; half-up whole rupiah',{'units':'0'});extra('total',1019)
A('harga-jual',dict(cost=917,margin='17.5'),'values.minimum',C(F(917,1-F('0.175'))),'ceil(917/(1−17.5%))',{'margin':'100'})
A('margin-laba',dict(price=137,cost=211),'values.percent',Q(F(-74,137)*10000),'(137−211)/137 ×100%, scale100',{'price':'0'})
A('markup',dict(price=211,cost=137),'values.percent',Q(F(74,137)*10000),'(211−137)/137 ×100%, scale100',{'cost':'0'})
A('bep',dict(fixed=101,price=31,variable=17),'values.units',C(F(101,14)),'ceil(101/(31−17))',{'price':'-1'})
A('target-laba',dict(fixed=101,price=31,variable=17,target=53),'values.units',C(F(154,14)),'ceil((101+53)/(31−17))',{'target':'-1'})
A('harga-pokok-penjualan',dict(**period,opening=701,purchases=389,closing=211),'values.cogs',701+389-211,'Opening + purchases − closing',{'closing':'1091'})
A('yield-bahan',dict(unit='kg',gross='7.5',net='6.125'),'values.yield',Q(F('6.125')/F('7.5')*10000),'Net/gross ×100%; quantities same unit',{'gross':'0'})
A('penyusutan-garis-lurus',dict(cost=1237,residual=101,years=7),'values.annual',Q(F(1136,7)),'(cost−residual)/years',{'years':'0'})
A('arus-kas',dict(**period,opening=-73,receipts=153,payments=211),'values.closing',-73+153-211,'Opening + receipts − payments, signed',{'end':'2024-01-31'})
A('utilisasi-kapasitas',dict(**period,unit='unit',actual='13.5',capacity='11.25'),'values.utilization',Q(F('13.5')/F('11.25')*10000),'Actual/capacity; >100% not clamped',{'capacity':'0'})
A('perputaran-persediaan',dict(**period,cogs=777,opening=301,closing=413),'values.turnover',Q(F(777*2,714)*100),'COGS / ((opening+closing)/2); scale100',{'opening':'0','closing':'0'});extra('values.days',Q(F(29*714,2*777)*100))
A('reorder-point',dict(demand='2.75',lead='3.25',safety='1.125'),'values.reorder',C(F('2.75')*F('3.25')+F('1.125')),'ceil(daily demand × lead days + safety)',{'lead':'-1'})
A('runway-kas',dict(month='2026-11',cash=1013,outflow=317,inflow=101),'values.months',int(F(1013,216)*100),'Cash/(outflow−inflow), conservative floor hundredths',{'cash':'-1'})
A('biaya-layanan',dict(month='2026-11',fixed=1013,transactions=17,variable=13),'values.cost',C(F(1013,17))+13,'ceil(fixed / billed transactions) + variable',{'transactions':'0'})
A('tarif-freelance',dict(earnings=1037,expenses=211,hours='17.25'),'values.hourly',C(F(1248)/F('17.25')),'ceil((earnings+expenses)/hours)',{'hours':'0'})
A('food-cost',dict(servings=7,ingredients=[dict(price=137,package=11,usage='2.5',unit='kg'),dict(price=211,package=13,usage='3.75',unit='kg')]),'values.perServing',C((F(137)*F('2.5')/11+F(211)*F('3.75')/13)/7),'Sum ingredient price × usage/package, divide portions, ceil once',{'servings':'0'})
A('harga-borongan',dict(hours='3.25',hourly=137,materials=211,overhead=73,profit=101),'values.quote',C(F('3.25')*137+211+73+101),'ceil(hours × hourly + materials + overhead + target profit)',{'hours':'-1'})
# Discrete EOQ: enumerate total relevant cost, independently of integer square root.
eoq=min(range(1,1001),key=lambda q:F(173*29,q)+F(11*q,2))
A('eoq',dict(demand=173,order=29,holding=11),'values.quantity',eoq,'argmin q integer>0 of D×S/q + H×q/2 (exhaustive1..1000)',{'holding':'0'})
A('payback-period',dict(investment=107,period='bulan',flows=[dict(amount=31),dict(amount=-7),dict(amount=101)]),'values.payback',Q((2+F(107-24,101))*100),'First crossing: 2 + (107−(31−7))/101 months',{'flows':[]})
A('berat-volumetrik',dict(length=31,width=23,height=17,divisor=5000,actual='1.25'),'values.volumetric',Q(F(31*23*17,5000)*1000000),'cm³/divisor kg, microkg',{'divisor':'0'})
A('roas',dict(revenue=1237,spend=317),'values.roas',Q(F(1237,317)*100),'Revenue/ad spend, hundredths x',{'spend':'0'})
A('roas-impas',dict(revenue=1237,variable=611),'values.threshold',C(F(1237,626)*100),'ceil to .01 of revenue/contribution',{'revenue':'0'})
A('acos',dict(spend=317,revenue=1237),'values.acos',Q(F(317,1237)*10000),'Ad spend/revenue ×100%, scale100',{'revenue':'-1'})
A('konversi-toko',dict(visits=137,purchasing=17),'values.conversion',Q(F(17,137)*10000),'Purchasing visits / visits ×100%',{'visits':'0'})
A('nilai-pesanan-rata-rata',dict(revenue=1237,orders=17),'values.aov',Q(F(1237,17)*100),'Revenue/orders, sen',{'orders':'0'})
A('promo-seller',dict(price=1237,discount=211,share='37.5'),'values.proceeds',1237*100-Q(F(211)*F('0.375')*100),'Seller burden rounded to sen first; proceeds=integer price in sen−burden, documented ledger policy',{'discount':'1238'})
A('subsidi-ongkir',dict(actual=137,buyer=31,credit=53),'values.seller',(137-31-53)*100,'Actual shipping − buyer − verified subsidy',{'credit':'107'})
A('biaya-kemasan',dict(shipments=17,materials=[dict(price=137,quantity=11,usage='1.5',waste='12.5',unit='pcs'),dict(price=53,quantity=7,usage='0.25',waste=0,unit='m')]),'values.total',Q((F(137)*F('1.5')/(11*F('0.875'))+F(53)*F('.25')/7)*17*100),'Sum exact purchased cost/usable yield × usage, aggregate ×17, round once',{'shipments':'0'})
A('biaya-retur',dict(gross=137,recovery=31,rate='7.25',orders=17),'values.total',Q(F(106)*F('.0725')*17*100),'Expected net loss × return probability × orders; no early rounding',{'recovery':'138'})
A('kerugian-cod',dict(attempts=17,rate='7.25',loss=137),'values.total',Q(F(17)*F('.0725')*137*100),'Attempts × failure probability × loss',{'rate':'100.01'})
A('bunga-sederhana',dict(principal=1237,rate='7.25',months=7),'values.future',1237+Q(F(1237)*F('.0725')*F(7,12)),'Principal + round(P×annual rate×months/12)',{'months':'1201'})
A('bunga-majemuk',dict(principal=1237,rate='7.25',frequency=4,periods=7),'values.future',Q(F(1237)*(1+F('.0725')/4)**7),'round(P(1+r/f)^periods)',{'frequency':'3'})
def annuity(P,r,n):
 r=F(r)/12;payment=C(F(P,n) if r==0 else P*r/(1-(1+r)**(-n)))
 rows=[];balance=P
 for i in range(n):
  interest=Q(balance*r);paid=min(payment,balance+interest) if i<n-1 else balance+interest
  principal=paid-interest;balance-=principal;rows.append(dict(payment=paid,interest=interest,principal=principal,balance=balance))
 return rows,payment
loan,standard=annuity(1237,F('.0725'),7)
A('cicilan-anuitas',dict(principal=1237,rate='7.25',months=7),'values.total',sum(x['payment'] for x in loan),'Exact annuity ceil; monthly interest half-up on remaining principal; final closes',{'months':'0'});extra('values.last',loan[-1]['payment']);extra('values.interest',sum(x['interest'] for x in loan))
A('cicilan-flat',dict(principal=1237,rate='7.25',months=7),'values.total',1237+Q(F(1237)*F('.0725')*F(7,12)),'Total principal + aggregate flat interest; cumulative allocations telescope',{'months':'0'})
A('rasio-cicilan',dict(income=1237,debt=317),'values.ratio',Q(F(317,1237)*10000),'Debt/net income ×100%',{'income':'0'})
p=F(1)+F('.0725')/12;n=7;payment=C((F(2111)-F(317)*p**n)/sum(p**i for i in range(n)))
A('target-tabungan',dict(initial=317,target=2111,rate='7.25',months=n),'values.payment',payment*100,'End-month deposits: ceil((target−initial q^n)/Σq^i); verify prior rupiah fails',{'months':'0'})
A('dana-darurat',dict(expenses=317,months=7,available=613),'values.gap',317*7-613,'Expenses×months−available, floor gap at0',{'months':'0'})
gross=Q(F(1237)*F('.0725')*F(7,12));tax=Q(F(gross)*F('.175'))
A('deposito',dict(principal=1237,rate='7.25',months=7,tax='17.5',fees=3),'values.maturity',1237+gross-tax-3,'Gross interest rounded rupiah, withholding on rounded gross; cash reconciles',{'fees':'9999999999999'});extra('values.gross',gross);extra('values.withholding',tax)
A('imbal-hasil-investasi',dict(initial=1237,ending=1031,costs=17),'values.roi',Q(F(1031-1237-17,1237)*10000),'(Ending−initial−costs)/initial ×100%; negative supported',{'initial':'0'})
A('cagr',dict(initial=125,ending=216,years=3),'values.cagr',Q((F(6,5)-1)*1000000),'(216/125)^(1/3)−1 =6/5−1; scale1e6',{'years':'0'})
A('nilai-kini',dict(future=1237,rate='7.25',years=3),'values.present',Q(F(1237)/(1+F('.0725'))**3*100),'PV=FV/(1+r)^n, sen',{'years':'101'})
A('npv',dict(rate='7.25',cashflows=[dict(amount=-1237),dict(amount=611),dict(amount=733)]),'values.npv',Q((-1237+F(611)/(1+F('.0725'))+F(733)/(1+F('.0725'))**2)*100),'Signed ΣCF_t/(1+r)^t; year0 not discounted',{'cashflows':[]})
A('inflasi',dict(price=1237,rate='7.25',years=3),'values.future',Q(F(1237)*(1+F('.0725'))**3*100),'Price×(1+inflation)^years, sen',{'rate':'-1'})
A('rata-rata-beli-saham',dict(sharesPerLot=100,purchases=[dict(price='13.25',lots=2,fee=3),dict(price='17.75',lots=3,fee=7)]),'values.average',Q(F(F('13.25')*200+F('17.75')*300+10,500)*100),'(Σprice×shares+fees)/total shares, sen',{'purchases':[]})
A('untung-rugi-saham',dict(buyPrice='13.25',sellPrice='11.75',lots=3,sharesPerLot=100,buyFee=7,sellFee=3,sellTax=2),'values.profit',Q((F('11.75')*300-F('13.25')*300-7-3-2)*100),'Sale−buy−buyfee−sellfee−selltax, signed sen',{'lots':'0'})
A('bunga-efektif-pinjaman',dict(proceeds=1237,disbursed='2025-01-01',repayments=[dict(amount=1361,date='2026-01-01')]),'values.effective',Q(F(124,1237)*1000000),'365-day single payment: annual rate =1361/1237−1; percent4dp',{'repayments':[dict(amount=1361,date='2025-01-01')]})
first,_=annuity(1237,F('.0725'),7);remain=first[1]['balance'];second,_=annuity(remain,F('.1375'),5);mort=first[:2]+second
A('kpr',dict(price=1537,down=300,months=7,fixedRate='7.25',fixedMonths=2,nextRate='13.75',fees=17),'values.outlay',317+sum(x['payment'] for x in mort),'Two phase annuity: recast remaining principal after month2; add down+fees once',{'down':'1538'});extra('values.interest',sum(x['interest'] for x in mort))
base,std=annuity(1237,F('.0725'),7);bal=1237;early=[]
for i in range(7):
 interest=Q(bal*F('.0725')/12);ordinary=min(std,bal+interest) if i<6 else bal+interest;bal-=ordinary-interest
 added=min(211,bal) if i==1 else 0;bal-=added;early.append(dict(payment=ordinary+added+(7 if added else 0),interest=interest))
A('pelunasan-dipercepat',dict(principal=1237,months=7,rate='7.25',extra=211,eventMonth=2,penalty=7),'values.net',sum(x['interest'] for x in base)-sum(x['interest'] for x in early)-7,'Baseline interest−modified interest−actual penalty; extra after regular month2',{'eventMonth':'8'})
old,_=annuity(1237,F('.1375'),7);new,_=annuity(1237,F('.0725'),7)
A('refinancing',dict(principal=1237,months=7,oldRate='13.75',newRate='7.25',newMonths=7,cost=11),'values.net',sum(x['payment'] for x in old)-sum(x['payment'] for x in new)-11,'Undiscounted lifetime cash difference incl upfront cost once',{'newMonths':'0'})
A('kurs-mata-uang',dict(direction='usd-idr',amount='13.25',rate='15731.125',fee=317),'values.net',Q(F('13.25')*F('15731.125'))-317,'USD amount × manual IDR/USD; gross rounded once then IDR fee',{'rate':'0'})
A('engagement-rate',dict(likes=31,comments=7,saves=11,shares=13,basis='reach',denominator=317),'values.rate',Q(F(62,317)*10000),'Sum interactions / declared reach ×100%',{'denominator':'0'})
A('pertumbuhan-pengikut',dict(start=317,end=211),'values.rate',Q(F(-106,317)*10000),'(End−start)/start ×100%, signed',{'start':'-1'})
A('cpm',dict(spend=1237,impressions=3317),'values.cost',Q(F(1237*1000,3317)*100),'Spend/impressions ×1000; sen',{'impressions':'0'})
A('cpc',dict(spend=1237,clicks=317),'values.cost',Q(F(1237,317)*100),'Spend/clicks, sen',{'clicks':'0'})
A('cpa',dict(spend=1237,action='lead',acquisitions=17),'values.cost',Q(F(1237,17)*100),'Spend/attributed leads, sen',{'acquisitions':'0'})
A('ctr',dict(clicks=17,impressions=317),'values.rate',Q(F(17,317)*10000),'Clicks/impressions×100%',{'impressions':'0'})
A('estimasi-youtube',dict(views=3317,rpm='137.25'),'values.income',Q(F(3317)*F('137.25')/1000*100),'User RPM per1000totalviews, sen; hypothetical not official rate',{'views':'-1'})
A('tiktok',dict(mode='earnings',eligibleViews=3317,rpm='137.25',incomeBasis='assumed',sponsor='17.25',affiliate='3.75',gift='1.50'),'values.total',Q((F(3317)*F('137.25')/1000+F('22.5'))*100),'Hypothetical eligibleviews×userRPM/1000 + separate net sources',{'mode':'unknown'})
A('tarif-endorsement',dict(production=137,hours='1.25',hourly=31,overhead=17,usage=11,deliverables=3,margin='17.5'),'values.quote',C(3*(137+F('1.25')*31+17)/(1-F('.175')))+33,'ceil(production package costs/(1−margin)) + usage rights without margin',{'margin':'100'})
A('waktu-tonton',dict(views=317,minutes='2.75'),'values.hours',Q(F(317)*F('2.75')/60*100),'Views×average minutes/60, hundredthhours',{'minutes':'-1'})
A('diskon',dict(original=1237,discounts=[dict(rate='12.5'),dict(rate='7.25')]),'values.final',Q(F(1237)*(1-F('.125'))*(1-F('.0725'))),'Sequential discounts multiply remaining factors; cash once',{'discounts':[]})
A('harga-per-satuan',dict(packages=[dict(price=137,quantity=250,unit='g'),dict(price=211,quantity='0.5',unit='kg')]),'values.minimum',Q(F(211)/F('.5')*100),'Normalize kg: min(137/.25,211/.5)=422Rp/kg; display2dp',{'packages':[]})
A('bagi-tagihan',dict(service=7,tax=11,mode='proportional',people=[dict(subtotal=137),dict(subtotal=211),dict(subtotal=317)]),'values.grand',137+211+317+18,'Subtotal665 + fixed service7 + tax11; largest remainder must sum683',{'people':[]});extra('values.difference',0)
A('persen',dict(mode='portion',value='137.25',percent='17.5'),'values.result',Q(F('137.25')*F('.175')*10000),'Value×percentage/100,4dp',{'percent':'NaN'})
A('perubahan-persen',dict(previous='317',current='211'),'values.percent',Q(F(-106,317)*1000000),'(Current−previous)/previous×100%,4dp',{'previous':'-1'})
A('selisih-tanggal',dict(start='2024-02-27',end='2024-03-02',mode='elapsed'),'values.days',(date(2024,3,2)-date(2024,2,27)).days,'Python Gregorian date difference, leap day included',{'end':'2024-02-26'})
start=date(2024,2,26);end=date(2024,3,3);holiday=date(2024,2,29)
wd=sum(1 for i in range((end-start).days+1) if (start+timedelta(days=i)).weekday()<5 and start+timedelta(days=i)!=holiday)
A('hari-kerja',dict(start=start.isoformat(),end=end.isoformat(),weekend='sat-sun',holidays=[dict(date=holiday.isoformat())]),'values.workdays',wd,'Inclusive Python weekday enumeration excluding Feb29 holiday',{'end':'2024-02-25'})
A('usia',dict(birth='2000-02-29',reference='2024-03-01'),'values.totalDays',(date(2024,3,1)-date(2000,2,29)).days,'Python Gregorian elapsed days; calendar years24/months0/days1',{'reference':'1999-12-31'});extra('values.years',24);extra('values.days',1)
A('durasi-kerja',dict(start='22:45',end='06:15',endDay='next-day',**{'break':'37'}),'values.net',7*60+30-37,'Next-day elapsed450min−break37',{'break':'451'})
A('konsumsi-bbm',dict(distance='137.25',efficiency='13.75',price=1237),'values.cost',Q(F('137.25')/F('13.75')*1237),'Distance/km per litre × IDR/litre; aggregate cash',{'efficiency':'0'})
A('biaya-listrik',dict(power=317,hours='3.25',days=17,quantity=3,tariff='1375.25'),'values.cost',Q(F(317)*F('3.25')*17*3/1000*F('1375.25')),'W×hours/day×days×devices/1000 × usertariff',{'hours':'25'})
A('biaya-air',dict(usage='13.75',fixed=317,tiers=[dict(limit='bounded',upper=7,rate='1237.25'),dict(limit='unbounded',rate='2117.5')]),'values.bill',Q(7*F('1237.25')+F('6.75')*F('2117.5')+317),'Progressive marginal blocks7 and6.75 m3; fixed once',{'tiers':[]})
A('kebutuhan-cat',dict(gross='137.25',openings='17.75',coats=3,coverage='11.25',reserve='7.5',package='2.5'),'values.packages',C((F('119.5')*3/F('11.25')*F('1.075'))/F('2.5')),'ceil(netarea×coats/coverage×reservefactor/packagesize)',{'coverage':'0'})
required=C(F('13.75')/(F(31*23,10000))*F('1.075'))
A('kebutuhan-keramik',dict(area='13.75',length=31,width=23,perBox=7,reserve='7.5'),'values.boxes',C(F(required,7)),'ceil(ceil(area/tilearea ×1.075)/7)',{'perBox':'0'})
A('volume-beton',dict(reserve='7.5',elements=[dict(shape='prism',length='3.25',width='1.75',height='0.125',count=3)]),'exact.total',F('3.25')*F('1.75')*F('.125')*3*F('1.075'),'Sum prism m³ × reserve; exact rational',{'elements':[]},kind='rational')
A('skala-denah',dict(mode='drawing-real',value='3.25',scale=75,**{'from':'cm','to':'m'}),'exact',F('3.25')*75/100,'Drawing centimetres×75/100 to metres',{'scale':'0'},kind='rational')
A('konversi-panjang',dict(value='3.25',**{'from':'ft','to':'cm'}),'exact',F('3.25')*F('30.48'),'International foot=30.48cm exact',{'value':'-1'},kind='rational')
A('konversi-berat',dict(value='3.25',**{'from':'lb','to':'kg'}),'exact',F('3.25')*F('.45359237'),'International avoirdupois pound=0.45359237kg exact',{'value':'-1'},kind='rational')
A('konversi-suhu',dict(value='-40',**{'from':'C','to':'F'}),'exact',F(-40),'F=9C/5+32; −40 fixed point',{'value':'-273.150001'},kind='rational')
A('kecepatan-rata-rata',dict(distance='137.25',distanceUnit='km',hours=2,minutes=17,seconds='13.5',to='km/h'),'exact',F('137.25')*3600/F('8233.5'),'Total distance / elapsed seconds ×3600',{'hours':'0','minutes':'0','seconds':'0'},kind='rational')
# Model manual settlement: no current marketplace rates presumed.
settle=dict(price=1237,quantity=3,discount=211,cost=613,rate='7.25',fixed=17,other=11,basis='net',shipping=31)
payout=F(1237*3-211)*(1-F('.0725'))-17-11-31
A('blibli',settle,'primary.value',F(Q(payout)),'Net sales3500 less user7.25%, fixed17,other11,shipping31; round aggregate',{'quantity':'0'},kind='rational')
A('harga-jual-marketplace',dict(target=1237,discountRate='12.5',feeRate='7.25',fixed=31),'primary.value',F(C(F(1268)/(F('.875')*F('.9275')))),'ceil((target+fixed)/((1−discount)(1−fee)))',{'feeRate':'100'},kind='rational')
A('banding-biaya-marketplace',dict(price=1237,quantity=3,discount=211,cost=613,channels=[dict(label='A',rate='7.25',fixed=17,other=11,basis='net'),dict(label='B',rate=11,fixed=0,other=7,basis='gross')]),'channels.0.payout',F(3500)*F('.9275')-28,'ChannelA exactnet; ranking must use exact contributions',{'channels':[]},kind='rational')
A('bundel-produk',dict(price=1237,discount=211,rate='7.25',fixed=17,items=[dict(label='A',cost=137,quantity=3),dict(label='B',cost=211,quantity=2)]),'primary.value',F(Q(F(1026)*F('.9275')-17-411-422)),'Net1026 minus fee and all bundled HPP; round aggregate',{'items':[]},kind='rational')
A('stok-cover',dict(stock=137,daily='3.25'),'primary.value',F(137)/F('3.25'),'Stock / assumed daily sales, exact days',{'daily':'-1'},kind='rational')
A('ppn',dict(date='2026-11-01',treatment='general',confirmation='confirmed',mode='exclusive',amount=1237),'amount',Q(F(1237)*F('.12')*F(11,12)),'PMK131/2024:12%×11/12 commercialprice; modelcashhalfaway',{'treatment':'unknown'},[{'path':'status','kind':'literal','expected':'unsupported'},{'path':'amount','kind':'absent'}])
A('pph-23',dict(date='2026-11-01',type='services',recipient='domestic-body',identity='npwp',confirmation='confirmed',mode='exclusive',amount=1237,vat=0),'amount',Q(F(1237)*F('.02')),'UU36/2008Pasal23/PMK141:ordinaryservices2% exclusiveVAT',{'recipient':'unknown'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
A('pph-4-ayat-2-sewa',dict(date='2026-11-01',type='land-building',role='self',confirmation='confirmed',vatStatus='none',rent=137,service=211,maintenance=317,other=53),'amount',Q(F(718,10)),'PP34/2017:10% grossrentplusrelatedcharges, selfpay does not fakewithholding',{'vatStatus':'unresolved'},[{'path':'status','kind':'literal','expected':'unsupported'},{'path':'amount','kind':'absent'}])
A('gross-up-pajak',dict(target=1237,rate='17.5',fixed=31),'amount',C(F(1268)/F('.825')),'Singleuser-ratealgebra, ceil((target+fixed)/(1−rate)), notprogressivePPh21',{'rate':'100'})
months=[dict(turnover=377000000 if i==4 else 151000000 if i==5 else 31000000 if i==6 else 0) for i in range(12)]
umkm=dict(year=2026,month=7,registration='2026-05-03',taxpayer='individual',income='business',eligibility='confirmed',aggregation='confirmed',wpTurnoverScope='all-businesses',priorRelatedTurnover=100000000,currentRelatedTurnover=777000000,history='clean',months=months)
A('pph-final-umkm',umkm,'amount',Q(F(31000000,200)),'PP20/2026 + PMK164Pasal6: WPowncumulative528m beforeJuly alreadyuses500m; unrelatedWPonlyeligibility',{'registration':'2020-05-03'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
payroll=dict(year=2024,finalMonth=12,ptkp='K/0',employment='full-year',employers='single',relief='none',classification='ordinary',confirmation='confirmed')
A('pph-21-bulanan',dict(**payroll,month=5,gross=9000137),'amount',Q(F(9000137)*F('.0175')),'PP58/2023 TER A:8.55m<gross≤9.65m,1.75% of wholegross',{'month':'12'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
# Annual ordinary permanent employee; jobexpense capped6m/year, PTKP K0=58.5m.
net=150123457-6000000-1730000-311000;pkp=max(0,net-58500000)//1000*1000
annual=F(min(pkp,60000000),20)+F(max(0,pkp-60000000)*15,100)
A('pph-21-rekonsiliasi',dict(**payroll,aggregate='complete',deductions='confirmed',gross=150123457,contributions=1730000,zakat=311000,withheld=3710000),'amount',Q(annual)-3710000,'PMK168:annualnet−PTKPK0, PKPfloor1000, UU7Pasal17:5%first60m+15%next, lessactualwithheld',{'year':'2026'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
A('pajak-impor',dict(date='2024-06-03',mode='manual',regime='regular',incoterm='FOB',currency='USD',hs='84713020',confirmation='confirmed',reference='Audit manual independent assumption',fxStart='2024-05-29',fxEnd='2024-06-04',fx='15731.125',value='137.25',freight='17.75',insurance='3.125',dutyRate='7.25',vatRate=12,vatFactor=100,incomeRate='2.5',vatBase='plus-duty',incomeBase='plus-duty'),'amount',sum(Q(v) for v in [F('158.125')*F('15731.125')*F('.0725'),F('158.125')*F('15731.125')*F('1.0725')*F('.12'),F('158.125')*F('15731.125')*F('1.0725')*F('.025')]),'CIF×manualFX; duty7.25%;VAT12% andincome2.5%onCIF+duty; roundcomponentsbeforetotal',{'regime':'consignment'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
A('bphtb',dict(region='DKI',confirmation='confirmed',date='2024-11-01',acquisition='sale',first='confirmed',taxpayer='body',property='nonresidential',relation='not-applicable',facility='none-confirmed',value=900123457,njop=800123457),'amount',Q(F(900123457-250000000)*F('.05')),'DKI1/2024:5%max(NPOP,NJOP)lessfirstacquisitionNPOPTKP250m; nofacilities',{'date':'2026-11-01'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
A('pbb-p2',dict(region='DKI',confirmation='confirmed',year=2024,use='nonresidential',allocation='this-object',purpose='gross-only',land=317123457,building=211123457),'amount',Q(F(317123457+211123457-60000000)*F('.6')*F('.005')),'DKI1/2024/Pergub17:0.5%×60%×(NJOP−60m), grossbeforefacilities',{'year':'2026'},[{'path':'status','kind':'literal','expected':'unverified'},{'path':'amount','kind':'absent'}])
for slug in ['shopee','tiktok-shop','tokopedia','lazada']:
 inp=dict(price=1237,quantity=3,discount=211,cost=613,buyerShipping=31,shippingFlow='credited',shipping=53,reimbursement=17,receipts=11,other=7,coverage='ordinary',confirmation='complete',fees=[dict(label='Audit percent',type='percent',rate='7.25',basis='net',minimumMode='none',capMode='enabled',cap=211),dict(label='Audit fixed',type='fixed',amount=13,scope='unit',minimumMode='none',capMode='none')])
 payout=F(3500+31+17+11)-min(F(3500)*F('.0725'),211)-13*3-53-7
 A(slug,inp,'ledger.payout',payout,'Manual net3500+actualcredits59−cappedfee211−fixed39−shipping53−other7; nocurrentofficialrates',{'confirmation':'unknown'},[{'path':'ledger','kind':'absent'}],kind='rational');extra('ledger.payoutCash',Q(payout));extra('ledger.profitCash',Q(payout)-613*3)
# Independent invalid and baseline fixture output, with application-free provenance.
assert len(CASES)==100,len(CASES)
catalog=json.loads(Path('docs/audit/catalogue.json').read_text())
assert set(t['slug'] for t in catalog['tools'])==set(c['slug'] for c in CASES)
for c in CASES:
 t=next(t for t in catalog['tools'] if t['slug']==c['slug']);c['id']=t['id'];c['formulaVersion']=t['formulaVersion'];c['sources']=t['sources'];c['existingTests']=t['existingTests']
Path('docs/audit/oracles.json').write_text(json.dumps({'method':'Python Fraction/Decimal; no application imports; fresh input vectors','baseline':catalog['baseline'],'cases':CASES},indent=2,ensure_ascii=False)+'\n')
print(f'Wrote {len(CASES)} independent baselines and {len(CASES)} boundary/invalid vectors')
