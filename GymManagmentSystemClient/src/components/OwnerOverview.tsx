import React, { useEffect } from 'react';
import './OwnerOverview.css';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';

import { fetchMemberCountThunk } from '../redux/memberSlice';
import { fetchTrainerCountThunk } from '../redux/trainerSlice';
import { fetchAnalytics } from '../redux/ownerAnalyticsSlice';
import { fetchSubscriptionCountThunk } from '../redux/subscriptionSlice';

const OwnerOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Member count
  const { totalMembers, loading: loadingMembers } = useSelector(
    (state: RootState) => state.member
  );

  // Trainer count
  const { totalTrainers, loading: loadingTrainers } = useSelector(
    (state: RootState) => state.trainer
  );

  // Subscription count
  const { totalSubscriptions, loading: loadingSubscriptions } = useSelector(
    (state: RootState) => state.subscription
  );

  // Transactions from analytics
  const { transactions, loading: loadingAnalytics } = useSelector(
    (state: RootState) => state.owneranalytics
  );

  // Calculate total income from transactions
  const totalIncome = React.useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  useEffect(() => {
    const ownerToken = localStorage.getItem('ownerToken') || '';
    dispatch(fetchMemberCountThunk());
    dispatch(fetchTrainerCountThunk(ownerToken));
    dispatch(fetchSubscriptionCountThunk(ownerToken));
    dispatch(fetchAnalytics(ownerToken)); // fetch transactions for totalIncome
  }, [dispatch]);

  return (
    <div className="owner-overview">
      <div className="overview-card">
        <h3>Total Members</h3>
        <p>{loadingMembers ? "Loading..." : totalMembers}</p>
      </div>

      <div className="overview-card">
        <h3>Total Trainers</h3>
        <p>{loadingTrainers ? "Loading..." : totalTrainers}</p>
      </div>

      <div className="overview-card">
        <h3>Active Subscriptions</h3>
        <p>{loadingSubscriptions ? "Loading..." : totalSubscriptions}</p>
      </div>

      <div className="overview-card">
        <h3>Monthly Revenue</h3>
        <p>{loadingAnalytics ? "Loading..." : `Rs. ${totalIncome.toLocaleString()}`}</p>
      </div>
    </div>
  );
};

export default OwnerOverview;