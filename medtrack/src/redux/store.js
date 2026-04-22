import { configureStore } from "@reduxjs/toolkit";
import medicineReducer from "./medicineSlice";

export const store = configureStore({
  reducer: {
    medicines: medicineReducer,
  },
});