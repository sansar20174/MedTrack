import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  medicines: [],
};

const medicineSlice = createSlice({
  name: "medicines",
  initialState,
  reducers: {
    addMedicine: (state, action) => {
      state.medicines.push({
        ...action.payload,
        id: crypto.randomUUID(),
        history: {}, // Format: { 'YYYY-MM-DD': ['08:00', '14:00'] }
      });
    },
    deleteMedicine: (state, action) => {
      state.medicines = state.medicines.filter(
        (med) => med.id !== action.payload
      );
    },
    updateMedicine: (state, action) => {
      const index = state.medicines.findIndex((med) => med.id === action.payload.id);
      if (index !== -1) {
        state.medicines[index] = { ...state.medicines[index], ...action.payload };
      }
    },
    takeMedicine: (state, action) => {
      // payload: { id, date, time }
      const { id, date, time } = action.payload;
      const med = state.medicines.find((m) => m.id === id);
      if (med) {
        if (!med.history) med.history = {};
        if (!med.history[date]) med.history[date] = [];
        
        if (!med.history[date].includes(time)) {
          med.history[date].push(time);
          // Decrease stock if stock tracking is enabled
          if (med.stock > 0) {
            med.stock -= 1;
          }
        }
      }
    },
    untakeMedicine: (state, action) => {
      // payload: { id, date, time }
      const { id, date, time } = action.payload;
      const med = state.medicines.find((m) => m.id === id);
      if (med && med.history && med.history[date]) {
        med.history[date] = med.history[date].filter(t => t !== time);
        if (med.stock !== undefined) {
          med.stock += 1;
        }
      }
    }
  },
});

export const { addMedicine, deleteMedicine, updateMedicine, takeMedicine, untakeMedicine } = medicineSlice.actions;
export default medicineSlice.reducer;