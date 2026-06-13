import React, { useEffect, useState } from 'react';
import './Payments.css';
import {
  CreditCard, Calendar, Download, CheckCircle,
  Clock, Lock, AlertCircle, ChevronRight, Sparkles, X, Zap,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubscriptionThunk } from '../redux/subscriptionSlice';
import {
  fetchPaymentMethodsThunk,
  fetchTransactionsThunk,
  completePaymentThunk,
  addPaymentMethodThunk,
  deletePaymentMethodThunk,
  clearLastPayment,
  clearError,
} from '../redux/paymentSlice';
import type { RootState, AppDispatch } from '../redux/store';
import type { PaymentTransaction } from '../API/paymentAPI';
import { downloadInvoice } from '../utils/invoicegenerator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardForm {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

interface PlanFeature {
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: PlanFeature[];
  popular?: boolean;
}

type UpgradeStep = 'select' | 'payment' | 'processing' | 'success' | 'error' | null;

// ─── Plans config ─────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 3500,
    tagline: 'Essential gym access',
    features: [
      { label: 'Gym floor access (6 AM – 10 PM)', included: true },
      { label: 'Cardio equipment (treadmills, bikes)', included: true },
      { label: 'Free weights & machines', included: true },
      { label: 'Locker room & shower facilities', included: true },
      { label: 'Group fitness classes', included: false },
      { label: 'Personal trainer sessions', included: false },
      { label: 'Swimming pool access', included: false },
      { label: 'Guest passes (2/month)', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 6500,
    tagline: 'Most popular choice',
    popular: true,
    features: [
      { label: 'Gym floor access (5 AM – 11 PM)', included: true },
      { label: 'Cardio equipment (treadmills, bikes)', included: true },
      { label: 'Free weights & machines', included: true },
      { label: 'Locker room & shower facilities', included: true },
      { label: 'Group fitness classes (unlimited)', included: true },
      { label: 'Personal trainer sessions (2/month)', included: true },
      { label: 'Swimming pool access', included: false },
      { label: 'Guest passes (2/month)', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10500,
    tagline: 'Full facility access',
    features: [
      { label: 'Gym floor access (24/7)', included: true },
      { label: 'Cardio equipment (treadmills, bikes)', included: true },
      { label: 'Free weights & machines', included: true },
      { label: 'Locker room & shower facilities', included: true },
      { label: 'Group fitness classes (unlimited)', included: true },
      { label: 'Personal trainer sessions (4/month)', included: true },
      { label: 'Swimming pool access', included: true },
      { label: 'Guest passes (2/month)', included: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const formatShortDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const detectBrand = (n: string): string => {
  const s = n.replace(/\s/g, '');
  if (s.startsWith('4'))    return 'Visa';
  if (/^5[1-5]/.test(s))   return 'Mastercard';
  if (/^3[47]/.test(s))    return 'Amex';
  return 'Card';
};

const maskNumber = (last4: string) => `•••• •••• •••• ${last4}`;

// Match subscriptionId back to a human-readable plan name for the invoice.
// If the backend stores the plan id in subscriptionId, this resolves it.
// Otherwise falls back gracefully to a capitalised version of whatever comes back.
const resolvePlanName = (subscriptionType: string): string => {
  const match = PLANS.find((p) => p.id === subscriptionType.toLowerCase());
  return match ? `${match.name} Membership` : `${subscriptionType} Membership`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const Payments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Redux selectors ──────────────────────────────────────────────────────
  const { data: subscription, loading: subLoading, error: subError } = useSelector(
    (state: RootState) => state.subscription
  );
  const {
    methods: paymentMethods,
    transactions,
    loading: paymentLoading,
    error: paymentError,
    lastPayment,
  } = useSelector((state: RootState) => state.payments);

  // Prefer the default card; fall back to the first card available
  const savedCard = paymentMethods.find((m) => m.isDefault) ?? paymentMethods[0] ?? null;

  // Member name for the invoice:
  // Uses the cardholder name stored on the saved payment method.
  // Falls back to "Valued Member" if no card has been saved yet.
  const memberNameForInvoice = savedCard?.cardHolderName ?? 'Valued Member';

  // ── Upgrade flow ──────────────────────────────────────────────────────────
  const [upgradeStep, setUpgradeStep]   = useState<UpgradeStep>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formError, setFormError]       = useState('');
  const [cardForm, setCardForm]         = useState<CardForm>({
    cardNumber: '', cardHolder: '', expiry: '', cvv: '',
  });

  // ── Update-card form ──────────────────────────────────────────────────────
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm]         = useState<CardForm>({
    cardNumber: '', cardHolder: '', expiry: '', cvv: '',
  });
  const [updateError, setUpdateError] = useState('');

  // ── Invoice download state ────────────────────────────────────────────────
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ── On mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMySubscriptionThunk());
    dispatch(fetchPaymentMethodsThunk());
    dispatch(fetchTransactionsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (lastPayment && upgradeStep === 'processing') setUpgradeStep('success');
  }, [lastPayment]);

  useEffect(() => {
    if (paymentError && upgradeStep === 'processing') setUpgradeStep('error');
  }, [paymentError]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const closeModal = () => {
    setUpgradeStep(null);
    setSelectedPlan(null);
    setFormError('');
    setCardForm({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
    dispatch(clearLastPayment());
    dispatch(clearError());
  };

  // ── Card input helpers ────────────────────────────────────────────────────
  const handleCardInput = (field: keyof CardForm, value: string) => {
    setFormError('');
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry')     value = formatExpiry(value);
    if (field === 'cvv')        value = value.replace(/\D/g, '').slice(0, 4);
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCard = (form: CardForm): string | null => {
    if (form.cardNumber.replace(/\s/g, '').length < 13) return 'Enter a valid card number.';
    if (!form.cardHolder.trim())  return 'Enter the cardholder name.';
    if (form.expiry.length < 5)  return 'Enter a valid expiry date.';
    if (form.cvv.length < 3)     return 'Enter a valid CVV.';
    return null;
  };

  // ── Payment flow ──────────────────────────────────────────────────────────
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (savedCard) {
      setUpgradeStep('processing');
      dispatch(completePaymentThunk({
        subscriptionId:   subscription?.id ?? '',
        subscriptionType: plan.id,
        amount:           plan.price,
        savePaymentMethod: false,
      }));
    } else {
      setUpgradeStep('payment');
    }
  };

  const handlePayNow = () => {
    const err = validateCard(cardForm);
    if (err) { setFormError(err); return; }
    if (!selectedPlan || !subscription) return;
    setUpgradeStep('processing');
    dispatch(completePaymentThunk({
      subscriptionId:   subscription.id,
      subscriptionType: selectedPlan.id,
      amount:           selectedPlan.price,
      savePaymentMethod: true,
      cardHolderName:   cardForm.cardHolder,
      cardNumber:       cardForm.cardNumber.replace(/\s/g, ''),
      expiry:           cardForm.expiry,
      isDefault:        true,
    }));
  };

  // ── Update card ───────────────────────────────────────────────────────────
  const handleUpdateInput = (field: keyof CardForm, value: string) => {
    setUpdateError('');
    if (field === 'cardNumber') value = formatCardNumber(value);
    if (field === 'expiry')     value = formatExpiry(value);
    if (field === 'cvv')        value = value.replace(/\D/g, '').slice(0, 4);
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateCard = async () => {
    const err = validateCard(updateForm);
    if (err) { setUpdateError(err); return; }
    if (savedCard) await dispatch(deletePaymentMethodThunk(savedCard.id));
    const result = await dispatch(addPaymentMethodThunk({
      cardHolderName: updateForm.cardHolder,
      cardNumber:     updateForm.cardNumber.replace(/\s/g, ''),
      expiry:         updateForm.expiry,
      isDefault:      true,
    }));
    if (addPaymentMethodThunk.fulfilled.match(result)) {
      setShowUpdateForm(false);
      setUpdateForm({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
      dispatch(fetchPaymentMethodsThunk());
    } else {
      setUpdateError('Failed to save card. Please try again.');
    }
  };

  // ── Invoice download ──────────────────────────────────────────────────────
  const handleDownloadInvoice = (tx: PaymentTransaction) => {
    setDownloadingId(tx.id);
    try {
      downloadInvoice({
        transaction: tx,
        memberName:  memberNameForInvoice,
        memberId:    tx.memberId,
        planName:    resolvePlanName(tx.subscriptionId),
        gymName:     'FitIQ Gym',        // ← replace with your gym name
        gymAddress:  'Kandy, Sri Lanka',   // ← replace with your gym address
        gymPhone:    '+94 77 000 0000',    // ← replace with your gym phone
        gymEmail:    'info@fitiqgym.lk', // ← replace with your gym email
      });
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="payments">

      {/* ══ UPGRADE FLOW MODAL ══════════════════════════════════════════════ */}
      {upgradeStep && (
        <div className="modal-backdrop" onClick={upgradeStep === 'processing' ? undefined : closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>

            {/* Step 1 — Plan selector */}
            {upgradeStep === 'select' && (
              <>
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title">Choose Your Membership</h2>
                    <p className="modal-subtitle">Monthly gym membership — all prices in LKR</p>
                  </div>
                  <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
                </div>
                <div className="modal-plans">
                  {PLANS.map((plan) => (
                    <div key={plan.id} className={`modal-plan-card ${plan.popular ? 'popular' : ''}`}>
                      {plan.popular && <div className="modal-popular-badge">Most Popular</div>}
                      <div className="modal-plan-top">
                        <span className="modal-plan-name">{plan.name}</span>
                        <span className="modal-plan-tagline">{plan.tagline}</span>
                        <span className="modal-plan-price">
                          {formatLKR(plan.price)}<span className="modal-plan-period">/month</span>
                        </span>
                      </div>
                      <ul className="modal-plan-features">
                        {plan.features.map((f, i) => (
                          <li key={i} className={f.included ? 'included' : 'excluded'}>
                            {f.included ? <CheckCircle size={13} /> : <span className="feature-x">✕</span>}
                            {f.label}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`modal-select-btn ${plan.popular ? 'primary' : 'secondary'}`}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={paymentLoading}
                      >
                        <Sparkles size={14} />
                        {savedCard ? `Auto-pay ${formatLKR(plan.price)}` : `Select ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2 — Card entry */}
            {upgradeStep === 'payment' && selectedPlan && (
              <>
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title">Complete Payment</h2>
                    <p className="modal-subtitle">
                      {selectedPlan.name} Membership · <strong>{formatLKR(selectedPlan.price)}/month</strong>
                    </p>
                  </div>
                  <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
                </div>
                <div className="payment-summary-strip">
                  <div className="summary-row">
                    <span>{selectedPlan.name} Gym Membership</span>
                    <span>{formatLKR(selectedPlan.price)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total due today</span>
                    <span>{formatLKR(selectedPlan.price)}</span>
                  </div>
                  <p className="summary-note">Your card will be saved for automatic monthly renewal.</p>
                </div>
                <div className="card-form-wrapper" style={{ marginTop: '1.25rem' }}>
                  <div className="card-preview">
                    <div className="card-preview-top">
                      <div className="card-preview-chip" />
                      <span className="card-preview-brand">
                        {cardForm.cardNumber ? detectBrand(cardForm.cardNumber) : 'Card'}
                      </span>
                    </div>
                    <div className="card-preview-number">
                      {cardForm.cardNumber
                        ? cardForm.cardNumber.padEnd(19, ' ').replace(/ /g, '\u00A0')
                        : '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-preview-bottom">
                      <div>
                        <span className="card-preview-label">Card holder</span>
                        <span className="card-preview-value">{cardForm.cardHolder || 'YOUR NAME'}</span>
                      </div>
                      <div>
                        <span className="card-preview-label">Expires</span>
                        <span className="card-preview-value">{cardForm.expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-form">
                    <div className="form-group full">
                      <label className="form-label">Card Number</label>
                      <input className="form-input" type="text" placeholder="1234 5678 9012 3456"
                        value={cardForm.cardNumber}
                        onChange={(e) => handleCardInput('cardNumber', e.target.value)}
                        maxLength={19} inputMode="numeric" />
                    </div>
                    <div className="form-group full">
                      <label className="form-label">Cardholder Name</label>
                      <input className="form-input" type="text" placeholder="Name on card"
                        value={cardForm.cardHolder}
                        onChange={(e) => handleCardInput('cardHolder', e.target.value)} />
                    </div>
                    <div className="form-group half">
                      <label className="form-label">Expiry</label>
                      <input className="form-input" type="text" placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={(e) => handleCardInput('expiry', e.target.value)}
                        maxLength={5} inputMode="numeric" />
                    </div>
                    <div className="form-group half">
                      <label className="form-label">CVV</label>
                      <input className="form-input" type="password" placeholder="•••"
                        value={cardForm.cvv}
                        onChange={(e) => handleCardInput('cvv', e.target.value)}
                        maxLength={4} inputMode="numeric" />
                    </div>
                    {formError && <div className="form-error"><AlertCircle size={14} />{formError}</div>}
                    <div className="form-security-note">
                      <Lock size={12} />Card saved securely for future auto-payments.
                    </div>
                    <div className="form-actions">
                      <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                      <button
                        className={`pay-now-btn ${paymentLoading ? 'loading' : ''}`}
                        onClick={handlePayNow}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? <span className="btn-spinner" /> : <Lock size={15} />}
                        {paymentLoading ? 'Processing…' : `Pay Now · ${formatLKR(selectedPlan.price)}`}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 — Processing */}
            {upgradeStep === 'processing' && (
              <div className="processing-screen">
                <div className="processing-spinner" />
                <h2 className="processing-title">Processing Payment…</h2>
                <p className="processing-sub">
                  {savedCard ? `Charging ${maskNumber(savedCard.last4)}` : 'Authorising your card'}
                </p>
              </div>
            )}

            {/* Step 4 — Success */}
            {upgradeStep === 'success' && selectedPlan && lastPayment && (
              <div className="success-screen">
                <div className="success-icon-wrap"><CheckCircle size={40} /></div>
                <h2 className="success-title">Payment Successful!</h2>
                <p className="success-sub">
                  You're now on the <strong>{selectedPlan.name}</strong> membership.
                </p>
                <div className="success-detail">
                  <div className="success-row">
                    <span>Amount charged</span>
                    <strong>{formatLKR(lastPayment.transaction.amount)}</strong>
                  </div>
                  <div className="success-row">
                    <span>Transaction ID</span>
                    <strong className="tx-id">{lastPayment.transaction.id}</strong>
                  </div>
                  {lastPayment.paymentMethod && (
                    <div className="success-row">
                      <span>Card</span>
                      <strong>{maskNumber(lastPayment.paymentMethod.last4)}</strong>
                    </div>
                  )}
                  <div className="success-row">
                    <span>Next payment</span>
                    <strong>Auto-charged monthly</strong>
                  </div>
                </div>
                <div className="success-autopay-note">
                  <Zap size={14} />
                  Your card is saved. Renewals happen automatically — no action needed.
                </div>
                <button
                  className="download-btn invoice-success-btn"
                  onClick={() => handleDownloadInvoice(lastPayment.transaction)}
                  disabled={downloadingId === lastPayment.transaction.id}
                >
                  {downloadingId === lastPayment.transaction.id
                    ? <span className="btn-spinner-dark" />
                    : <Download size={15} />}
                  {downloadingId === lastPayment.transaction.id ? 'Generating…' : 'Download Invoice'}
                </button>
                <button
                  className="pay-now-btn"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={() => {
                    closeModal();
                    dispatch(fetchPaymentMethodsThunk());
                    dispatch(fetchTransactionsThunk());
                    dispatch(fetchMySubscriptionThunk());
                  }}
                >
                  Done
                </button>
              </div>
            )}

            {/* Step 5 — Error */}
            {upgradeStep === 'error' && (
              <div className="processing-screen">
                <div className="error-icon-wrap"><AlertCircle size={40} /></div>
                <h2 className="processing-title" style={{ color: 'var(--primary)' }}>Payment Failed</h2>
                <p className="processing-sub">{paymentError ?? 'Something went wrong.'}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="pay-now-btn" onClick={() => {
                    dispatch(clearError());
                    setUpgradeStep(selectedPlan && !savedCard ? 'payment' : 'select');
                  }}>Try Again</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══ PAGE CONTENT ════════════════════════════════════════════════════ */}

      <div className="payments-header">
        <div className="payments-header-content">
          <h1>Payments & Subscription</h1>
          <p>Manage your membership and payment history</p>
        </div>
      </div>

      <div className="payments-grid">

        {/* ── Current Subscription ── */}
        <div className="subscription-card">
          <div className="subscription-header">
            <div className="subscription-icon"><CreditCard size={32} /></div>
            <h2>Current Subscription</h2>
          </div>
          <div className="subscription-details">
            {subLoading && <p className="loading-text">Loading subscription...</p>}
            {subError   && <p className="error-text">{subError}</p>}
            {!subLoading && !subError && subscription && (
              <>
                <div className="subscription-plan">
                  <span className="plan-name">{subscription.type}</span>
                  <span className={`plan-status ${subscription.active ? 'status-active' : 'status-inactive'}`}>
                    {subscription.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="subscription-info">
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value"><Calendar size={16} />{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">End Date</span>
                    <span className="info-value"><Calendar size={16} />{formatDate(subscription.endDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`info-value ${subscription.active ? 'status-active' : 'status-inactive'}`}>
                      {subscription.active ? 'Active' : 'Expired'}
                    </span>
                  </div>
                </div>
                {subscription.type === 'Free Trial' && (
                  <div className="trial-warning">
                    <AlertCircle size={15} />
                    <div>
                      <strong>Trial ends {formatDate(subscription.endDate)}</strong>
                      <p>Upgrade now to keep your access without interruption.</p>
                    </div>
                  </div>
                )}
                <div className="subscription-actions">
                  <button className="action-btn primary" onClick={() => setUpgradeStep('select')}>
                    <Sparkles size={15} />
                    {subscription.type === 'Free Trial' ? 'Upgrade Membership' : 'Change Membership'}
                  </button>
                  {savedCard && (
                    <button className="action-btn secondary" onClick={() => setShowUpdateForm(true)}>
                      Update Payment Method
                    </button>
                  )}
                </div>
                {savedCard && (
                  <div className="autopay-notice">
                    <CheckCircle size={14} />
                    Auto-pay enabled · Next charge on <strong>{formatDate(subscription.endDate)}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Payment History ── */}
        <div className="payment-history">
          <h2>Payment History</h2>
          <div className="payments-list">
            {paymentLoading && transactions.length === 0 && (
              <p className="loading-text">Loading transactions...</p>
            )}
            {!paymentLoading && transactions.length === 0 && (
              <div className="no-transactions">
                <Clock size={28} />
                <p>No transactions yet.</p>
                <span>Your payment history will appear here after your first payment.</span>
              </div>
            )}
            {[...transactions]
              .sort((a, b) =>
                new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
              )
              .map((tx) => (
                <div key={tx.id} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-icon"><CheckCircle size={20} /></div>
                    <div className="payment-details">
                      <h4>Gym Membership</h4>
                      <p className="payment-date">{formatShortDate(tx.transactionDate)}</p>
                      
                    </div>
                  </div>
                  <div className="payment-right">
                    <span className="payment-amount">{formatLKR(tx.amount)}</span>
                    <button
                      className={`download-btn ${downloadingId === tx.id ? 'downloading' : ''}`}
                      onClick={() => handleDownloadInvoice(tx)}
                      disabled={downloadingId === tx.id}
                      title="Download invoice PDF"
                    >
                      {downloadingId === tx.id
                        ? <span className="btn-spinner-dark" />
                        : <Download size={16} />}
                      {downloadingId === tx.id ? 'Generating…' : 'Invoice'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── Payment Method Section ── */}
      <div id="payment-method-section" className="payment-method-section">
        <div className="payment-method-header">
          <div>
            <h2>Payment Method</h2>
            <p className="payment-method-subtitle">
              {savedCard
                ? 'Your card is saved. Future payments are charged automatically.'
                : 'No card saved yet. Add one when you upgrade your membership.'}
            </p>
          </div>
          {savedCard && !showUpdateForm && (
            <button className="action-btn secondary small" onClick={() => setShowUpdateForm(true)}>
              Update card
            </button>
          )}
        </div>

        {paymentLoading && !savedCard && <p className="loading-text">Loading payment method...</p>}

        {savedCard && !showUpdateForm && (
          <div className="saved-card-display">
            <div className="saved-card-chip" />
            <div className="saved-card-info">
              <div className="saved-card-number">
                <span className="dots">•••• •••• ••••</span>
                <span className="last4">{savedCard.last4}</span>
              </div>
              <div className="saved-card-meta">
                <span className="card-brand-icon">{savedCard.cardBrand}</span>
                <span className="expiry">Expires {savedCard.expiry}</span>
              </div>
            </div>
          </div>
        )}

        {!savedCard && !showUpdateForm && !paymentLoading && (
          <div className="no-card-banner" onClick={() => setUpgradeStep('select')} role="button" tabIndex={0}>
            <div className="no-card-icon"><CreditCard size={22} /></div>
            <div>
              <p className="no-card-title">No payment method saved</p>
              <p className="no-card-sub">Click Upgrade Membership to add your card and pay</p>
            </div>
            <ChevronRight size={18} className="no-card-arrow" />
          </div>
        )}

        {showUpdateForm && (
          <div className="card-form-wrapper">
            <div className="card-preview">
              <div className="card-preview-top">
                <div className="card-preview-chip" />
                <span className="card-preview-brand">
                  {updateForm.cardNumber ? detectBrand(updateForm.cardNumber) : 'Card'}
                </span>
              </div>
              <div className="card-preview-number">
                {updateForm.cardNumber
                  ? updateForm.cardNumber.padEnd(19, ' ').replace(/ /g, '\u00A0')
                  : '•••• •••• •••• ••••'}
              </div>
              <div className="card-preview-bottom">
                <div>
                  <span className="card-preview-label">Card holder</span>
                  <span className="card-preview-value">{updateForm.cardHolder || 'YOUR NAME'}</span>
                </div>
                <div>
                  <span className="card-preview-label">Expires</span>
                  <span className="card-preview-value">{updateForm.expiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>
            <div className="card-form">
              <div className="form-group full">
                <label className="form-label">Card Number</label>
                <input className="form-input" type="text" placeholder="1234 5678 9012 3456"
                  value={updateForm.cardNumber}
                  onChange={(e) => handleUpdateInput('cardNumber', e.target.value)}
                  maxLength={19} inputMode="numeric" />
              </div>
              <div className="form-group full">
                <label className="form-label">Cardholder Name</label>
                <input className="form-input" type="text" placeholder="Name on card"
                  value={updateForm.cardHolder}
                  onChange={(e) => handleUpdateInput('cardHolder', e.target.value)} />
              </div>
              <div className="form-group half">
                <label className="form-label">Expiry</label>
                <input className="form-input" type="text" placeholder="MM/YY"
                  value={updateForm.expiry}
                  onChange={(e) => handleUpdateInput('expiry', e.target.value)}
                  maxLength={5} inputMode="numeric" />
              </div>
              <div className="form-group half">
                <label className="form-label">CVV</label>
                <input className="form-input" type="password" placeholder="•••"
                  value={updateForm.cvv}
                  onChange={(e) => handleUpdateInput('cvv', e.target.value)}
                  maxLength={4} inputMode="numeric" />
              </div>
              {updateError && <div className="form-error"><AlertCircle size={14} />{updateError}</div>}
              <div className="form-security-note"><Lock size={12} />Your card details are encrypted.</div>
              <div className="form-actions">
                <button className="action-btn secondary"
                  onClick={() => { setShowUpdateForm(false); setUpdateError(''); }}>
                  Cancel
                </button>
                <button
                  className={`action-btn primary ${paymentLoading ? 'loading' : ''}`}
                  onClick={handleUpdateCard}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? <span className="btn-spinner" /> : <Lock size={14} />}
                  {paymentLoading ? 'Saving…' : 'Save new card'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-transactions {
          display:flex; flex-direction:column; align-items:center;
          gap:8px; padding:2.5rem 1rem;
          color:var(--text-secondary); text-align:center;
        }
        .no-transactions svg { opacity:0.35; }
        .no-transactions p   { font-weight:600; font-size:0.95rem; margin:0; color:var(--text-primary); }
        .no-transactions span { font-size:0.82rem; }
        .download-btn.downloading { opacity:0.7; pointer-events:none; }
        .btn-spinner-dark {
          display:inline-block; width:13px; height:13px;
          border:2px solid rgba(0,0,0,0.15); border-top-color:currentColor;
          border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0;
        }
        .invoice-success-btn {
          width:100%; margin-top:1rem; justify-content:center;
          gap:8px; padding:10px; font-size:0.85rem;
        }
      `}</style>
    </div>
  );
};

export default Payments;