import { createPortal } from 'react-dom';
import useAccessibleModal from '../../../hooks/useAccessibleModal';
const money=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2});
export default function FeePlanDetails({plan,sessionName,onClose,onEdit}) {
 const ref=useAccessibleModal(true,onClose);
 const date=v=>v?new Date(v+'T00:00:00').toLocaleDateString('en-IN'):'—';
 const fields=[['Academic Session',sessionName||'Unavailable'],['Grade','Grade '+plan.grade],['Status',plan.status],['Admission Fee',money.format(plan.admissionFee)],['Tuition per Installment',money.format(plan.tuitionFee)],['Billing Frequency',plan.billingFrequency],['Installments',plan.installments],['Due Day','Day '+plan.dueDay],['Grace Period',plan.gracePeriodDays+' days'],['Late Fee',money.format(plan.lateFee)],['Effective From',date(plan.effectiveFrom)],['Effective To',date(plan.effectiveTo)]];
 return createPortal(<div className="tutor-details-backdrop"><section className="tutor-details" ref={ref} role="dialog" aria-modal="true" aria-labelledby="fee-details-title" tabIndex={-1}><header><div><p>FEE PLAN DETAILS</p><h2 id="fee-details-title">{plan.name}</h2></div><button aria-label="Close fee plan details" onClick={onClose}>×</button></header><dl>{fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="fee-details-note"><strong>Plan total: {money.format(Number(plan.admissionFee)+Number(plan.tuitionFee)*Number(plan.installments))}</strong><p>Excludes late fees. Applies to every board, subject and teaching mode for this grade.</p></div><footer><button onClick={onEdit}>Edit Fee Plan</button></footer></section></div>,document.body);
}
