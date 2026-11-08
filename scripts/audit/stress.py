"""Independent adversarial numeric probes, extending the 100 baseline oracles."""
from oracles import F,Q,C,S,annuity
from decimal import Decimal,localcontext,ROUND_HALF_UP
from datetime import date,timedelta
from pathlib import Path
import json
vectors=[]
def add(slug,inp,checks,note):vectors.append(dict(slug=slug,input=S(inp),checks=[dict(path=p,kind='integer',expected=str(v)) for p,v in checks.items()],note=note))
for P in [1,13,1237,9999999999999]:
 for r in ['0','7.25','100']:
  for n in [1,7,120]:
   rows,std=annuity(P,F(r)/100,n)
   add('cicilan-anuitas',dict(principal=P,rate=r,months=n),{'values.standard':std,'values.total':sum(x['payment'] for x in rows),'values.interest':sum(x['interest'] for x in rows),'values.last':next((x['payment'] for x in reversed(rows) if x['payment']),0)},'Exact annuity plus independently constructed whole-IDR schedule')
   add('cicilan-flat',dict(principal=P,rate=r,months=n),{'values.total':P+Q(P*F(r)/100*F(n,12)),'values.interest':Q(P*F(r)/100*F(n,12))},'Cumulative flat schedule telescopes to principal + rounded total interest')
for fixed in [0,1,6,7]:
 rows,std=annuity(1237,F('.0725'),7);first=rows[:fixed];balance=first[-1]['balance'] if first else 1237
 nextrows=[] if fixed==7 else annuity(balance,F('.1375'),7-fixed)[0]
 allrows=first+nextrows
 add('kpr',dict(price=1537,down=300,months=7,fixedRate='7.25',fixedMonths=fixed,nextRate='13.75',fees=17),{'values.total':sum(x['payment'] for x in allrows),'values.outlay':317+sum(x['payment'] for x in allrows),'values.switchBalance':balance},'Fixed/floating boundaries0,1,6,7; recast remaining principal once')
for P,r,n in [(1237,'7.25',7),(9999999999999,'100',120),(1,'0',7)]:
 for month in [1,max(1,n//2)]:
  base,std=annuity(P,F(r)/100,n);balance=P;rows=[];extra=P//4 or 1;fee=3
  # Early extra is only supported before the ordinary payment fully repays principal.
  if base[month-1]['balance']==0:continue
  for i in range(n):
   interest=Q(balance*F(r)/1200);ordinary=min(std,balance+interest) if i<n-1 else balance+interest;balance-=ordinary-interest
   added=min(extra,balance) if i+1==month else 0;balance-=added;rows.append((ordinary+added+(fee if added else 0),interest))
  add('pelunasan-dipercepat',dict(principal=P,months=n,rate=r,extra=extra,eventMonth=month,penalty=fee),{'values.total':sum(x[0] for x in rows),'values.net':sum(x['interest'] for x in base)-sum(x[1] for x in rows)-fee},'Penalty once only on actual extra; final balance zero')
# Independently solve annual discount yield on ACT/365 days, not the app daily-factor solver.
for proceeds,payments in [(1000,[(365,600),(730,600)]),(1237,[(31,317),(137,511),(377,613)]),(2000,[(365,1000),(730,500)]),(1000,[(1,1001)])]:
 with localcontext() as ctx:
  ctx.prec=90;lo=Decimal('-0.999999999');hi=Decimal(1000)
  for _ in range(450):
   mid=(lo+hi)/2;pv=sum(Decimal(amount)/(1+mid)**(Decimal(days)/365) for days,amount in payments)
   if pv>proceeds:lo=mid
   else:hi=mid
  expected=int((((lo+hi)/2)*1000000).to_integral_value(rounding=ROUND_HALF_UP))
 start=date(2025,1,1)
 add('bunga-efektif-pinjaman',dict(proceeds=proceeds,disbursed=start.isoformat(),repayments=[dict(amount=a,date=(start+timedelta(days=d)).isoformat()) for d,a in payments]),{'values.effective':expected},'Decimal90 annual-rate bisection of sum CF/(1+r)^(days/365); irregular, negative, one-day yields')
for year in [1899,1900,1999,2000,2024,2099,2100,9998]:
 start=date(year,2,27);end=date(year,3,2)
 add('selisih-tanggal',dict(start=start.isoformat(),end=end.isoformat(),mode='elapsed'),{'values.days':(end-start).days},'Python Gregorian leap-century oracle')
for initial,ending,years in [(9999999999999,1,100),(1237,211,7),(211,1237,7),(1237,1237,100),(1237,0,1)]:
 with localcontext() as ctx:
  ctx.prec=90;r=Decimal(-1) if ending==0 else (Decimal(ending)/initial)**(Decimal(1)/years)-1
  expected=int((r*1000000).to_integral_value(rounding=ROUND_HALF_UP))
 add('cagr',dict(initial=initial,ending=ending,years=years),{'values.cagr':expected},'Independent Decimal90 root; losses and near-boundary ratios')
for initial,target,r,n in [(317,2111,'7.25',7),(0,1,'0',600),(1237,1237,'100',120),(1,9999999999999,'7.25',600)]:
 q=1+F(r)/1200;payment=max(0,C((target-initial*q**n)/sum(q**i for i in range(n))))
 add('target-tabungan',dict(initial=initial,target=target,rate=r,months=n),{'values.payment':payment*100},'End-period annuity inverse ceil minimum, no deposits when existing balance sufficient')
for rate in ['0','7.25','100']:
 for amounts in [[-1237,317,-211,733],[0,-1,0,0],[-1,0,0,1],[-9999999999999,9999999999999,-1]]:
  value=sum(F(x)/(1+F(rate)/100)**i for i,x in enumerate(amounts))
  add('npv',dict(rate=rate,cashflows=[dict(amount=a) for a in amounts]),{'values.npv':Q(value*100)},'Signed Fraction discounted sum including year0; negative aggregate and ties')
for demand,order,holding in [(17,31,7),(1,1,100),(100,1,100),(173,29,11),(211,317,137),(999,3,19)]:
 optimum=min(range(1,2001),key=lambda q:F(demand*order,q)+F(holding*q,2))
 add('eoq',dict(demand=demand,order=order,holding=holding),{'values.quantity':optimum},'Brute-force integer cost minimization independent of application sqrt')
# User-rate manual ledger ties, signed cases and ceiling inversion.
for price in [0,1,7,9999999999999]:
 for rate in ['0','0.000001','50','100']:
  for slug in ['shopee','tiktok-shop','tokopedia','lazada']:
   inp=dict(price=price,quantity=3,discount=0,cost=1,buyerShipping=0,shippingFlow='excluded',shipping=1,reimbursement=0,receipts=0,other=0,coverage='ordinary',confirmation='complete',fees=[dict(label='Tie',type='percent',basis='gross',rate=rate,minimumMode='none',capMode='none')])
   payout=F(price*3)*(1-F(rate)/100)-1
   add(slug,inp,{'ledger.payoutCash':Q(payout),'ledger.profitCash':Q(payout)-3},'Fraction exact percentage, aggregate half-away signed cash, HPP conservation')
for rate in ['0','7.25','99.999999']:
 for target,fixed in [(0,0),(1,1),(1237,31),(9999999999999,9999999999999)]:
  gross=C(F(target+fixed)/(1-F(rate)/100))
  add('gross-up-pajak',dict(target=target,rate=rate,fixed=fixed),{'amount':gross},'Exact minimum integer inverse verified against target before rounding')
# Fresh legal tier and classification probes independently read from PP58 and PMK131.
payroll=dict(year=2024,month=5,finalMonth=12,employment='full-year',employers='single',relief='none',classification='ordinary',confirmation='confirmed')
for ptkp,boundary,below,above in [('TK/0',5400000,'0','.0025'),('TK/0',8550000,'.015','.0175'),('TK/2',6200000,'0','.0025'),('K/3',6600000,'0','.0025')]:
 for delta in [-1,0,1]:
  gross=boundary+delta;rate=F(above if delta>0 else below)
  add('pph-21-bulanan',dict(**payroll,ptkp=ptkp,gross=gross),{'amount':Q(gross*rate)},'Independent official PP58 selected A/B/C endpoints inclusive, ±Rp1')
for day,rate in [('2025-01-01','.11'),('2025-01-31','.11'),('2025-02-01','.12')]:
 add('ppn',dict(date=day,treatment='luxury-retail',confirmation='confirmed',mode='inclusive',amount=1237),{'amount':Q(F(1237)*F(rate)/(1+F(rate)))},'PMK131Pasal5 consumer-luxury January transition, inclusive price inversion')
# Largest remainder reference: allocate shared integer charges by sorted fractional remainders.
for subtotals,shared in [([1,1,1],1),([137,211,317],18),([0,7,11],1),([9999999999999,1,1],2)]:
 total=sum(subtotals);parts=[F(shared*x,total) for x in subtotals];alloc=[x.numerator//x.denominator for x in parts];remaining=shared-sum(alloc)
 order=sorted(range(len(parts)),key=lambda i:(-(parts[i]-alloc[i]),i))
 for i in order[:remaining]:alloc[i]+=1
 add('bagi-tagihan',dict(service=shared,tax=0,mode='proportional',people=[dict(subtotal=x) for x in subtotals]),{'values.difference':0,'values.grand':total+shared},'Independent largest remainders conserve all whole rupiah')
# Fresh cross-WP eligibility must not consume the individual allowance.
for related in [500001236,2000000000,4800000000]:
 months=[dict(turnover=499999999 if i==4 else 1237 if i==5 else 0) for i in range(12)]
 add('pph-final-umkm',dict(year=2026,month=6,registration='2026-05-03',taxpayer='individual',income='business',eligibility='confirmed',aggregation='confirmed',wpTurnoverScope='all-businesses',priorRelatedTurnover=0,currentRelatedTurnover=related,history='clean',months=months),{'amount':Q(F(1236,200))},'PMK164 own-WP500m boundary; varying PP20 related-party total only tests eligibility')
Path('docs/audit/stress-oracles.json').write_text(json.dumps(vectors,indent=2,ensure_ascii=False)+'\n')
print('stress cases',len(vectors))
