import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  medicines: [],
};

const medicineSlice = createSlice({
  name: "medicines",
  initialState: initialState,
  reducers: {
    addMedicine: function (state, action) {
      // Create a basic ID using a standard random string if crypto is complex
      let randomId = Math.random().toString(36).substring(2, 15);
      
      let newMedicine = {
        id: randomId,
        name: action.payload.name,
        dosage: action.payload.dosage,
        frequency: action.payload.frequency,
        times: action.payload.times,
        stock: action.payload.stock,
        refillThreshold: action.payload.refillThreshold,
        history: {}, // Format: { 'YYYY-MM-DD': ['08:00', '14:00'] }
      };

      state.medicines.push(newMedicine);
    },

    deleteMedicine: function (state, action) {
      let idToDelete = action.payload;
      let newMedicinesList = [];

      // Keep everything except the one we want to delete
      for (let i = 0; i < state.medicines.length; i++) {
        if (state.medicines[i].id !== idToDelete) {
          newMedicinesList.push(state.medicines[i]);
        }
      }

      state.medicines = newMedicinesList;
    },

    updateMedicine: function (state, action) {
      let updatedData = action.payload;

      for (let i = 0; i < state.medicines.length; i++) {
        if (state.medicines[i].id === updatedData.id) {
          state.medicines[i].name = updatedData.name;
          state.medicines[i].dosage = updatedData.dosage;
          state.medicines[i].frequency = updatedData.frequency;
          state.medicines[i].times = updatedData.times;
          state.medicines[i].stock = updatedData.stock;
          state.medicines[i].refillThreshold = updatedData.refillThreshold;
        }
      }
    },

    takeMedicine: function (state, action) {
      let id = action.payload.id;
      let date = action.payload.date;
      let time = action.payload.time;

      for (let i = 0; i < state.medicines.length; i++) {
        let med = state.medicines[i];

        if (med.id === id) {
          // Make sure history exists
          if (med.history === undefined || med.history === null) {
            med.history = {};
          }
          
          if (med.history[date] === undefined) {
            med.history[date] = [];
          }

          // Check if we already took it
          let alreadyTaken = false;
          for (let j = 0; j < med.history[date].length; j++) {
            if (med.history[date][j] === time) {
              alreadyTaken = true;
            }
          }

          // If not taken, record it and reduce stock
          if (alreadyTaken === false) {
            med.history[date].push(time);
            
            if (med.stock > 0) {
              med.stock = med.stock - 1;
            }
          }
        }
      }
    },

    untakeMedicine: function (state, action) {
      let id = action.payload.id;
      let date = action.payload.date;
      let time = action.payload.time;

      for (let i = 0; i < state.medicines.length; i++) {
        let med = state.medicines[i];

        if (med.id === id) {
          if (med.history !== undefined && med.history[date] !== undefined) {
            let newHistoryForDate = [];
            
            // Rebuild the history for that date without the specific time
            for (let j = 0; j < med.history[date].length; j++) {
              if (med.history[date][j] !== time) {
                newHistoryForDate.push(med.history[date][j]);
              }
            }
            
            med.history[date] = newHistoryForDate;
            
            // Give the pill back to stock
            if (med.stock !== undefined) {
              med.stock = med.stock + 1;
            }
          }
        }
      }
    }
  },
});

export const { addMedicine, deleteMedicine, updateMedicine, takeMedicine, untakeMedicine } = medicineSlice.actions;
export default medicineSlice.reducer;