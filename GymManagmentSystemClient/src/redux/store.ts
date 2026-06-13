import { configureStore } from "@reduxjs/toolkit";
import memberReducer from "./memberSlice.ts";
import attendanceReducer from "./attendanceSlice.ts";
import fitnessAssessmentReducer from "./fitnessAssessmentSlice.ts";
import trainerReducer from "./trainerSlice.ts";
import workoutPlanReducer from "./workoutPlanSlice.ts";
import dailySessionsReducer from "./dailySessionsSlice.ts";
import dietPlanReducer from "./dietPlanSlice.ts";
import dietLogReducer from "./dietLogSlice.ts";
import appointmenReducer from "./appointmentSlice.ts";
import subscriptionReducer from "./subscriptionSlice.ts";
import paymentReducer from "./paymentSlice.ts";
import ownerReducer from "./ownerSlice.ts";
import OwnerAnalyticsReducer from "./ownerAnalyticsSlice.ts";

export const store = configureStore({
  reducer: {
    member: memberReducer,
    attendance: attendanceReducer,
    fitnessassessment: fitnessAssessmentReducer,
    trainer: trainerReducer,
    workoutplan: workoutPlanReducer,
    dailysessions: dailySessionsReducer,
    dietplan: dietPlanReducer,
    dietlog: dietLogReducer,
    appointments: appointmenReducer,
    subscription: subscriptionReducer,
    payments: paymentReducer,
    owner: ownerReducer,
    owneranalytics: OwnerAnalyticsReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;