import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMedicine, updateMedicine } from "../redux/medicineSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Pill, Clock, AlertTriangle, ArrowRight } from "lucide-react";

function AddMedicine() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get the ID from the URL parameters
  const params = useParams();
  const id = params.id;

  // Get all medicines to find the one we might be editing
  const allMedicines = useSelector(function (state) {
    return state.medicines.medicines;
  });

  // Try to find the existing medicine if we have an ID
  let existingMedicine = null;
  if (id !== undefined) {
    for (let i = 0; i < allMedicines.length; i++) {
      if (allMedicines[i].id === id) {
        existingMedicine = allMedicines[i];
      }
    }
  }

  // The state that holds all form inputs
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    times: ["08:00"],
    stock: "",
    refillThreshold: "",
  });

  // Load the existing medicine data into the form when the component starts
  useEffect(function () {
    if (existingMedicine !== null) {
      let newFormData = {
        name: existingMedicine.name,
        dosage: existingMedicine.dosage,
        frequency: existingMedicine.frequency,
        times: existingMedicine.times,
        stock: existingMedicine.stock,
        refillThreshold: existingMedicine.refillThreshold,
      };

      // Fallback just in case times are empty
      if (newFormData.times === undefined || newFormData.times === null) {
        newFormData.times = ["08:00"];
      }

      setFormData(newFormData);
    }
  }, [existingMedicine]);

  // Handle any standard text input change
  function handleChange(event) {
    const inputName = event.target.name;
    const inputValue = event.target.value;

    // Create a manual copy of our form data
    let newFormData = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times,
      stock: formData.stock,
      refillThreshold: formData.refillThreshold,
    };

    // Update the correct property based on which input was typed in
    if (inputName === "name") {
      newFormData.name = inputValue;
    }
    if (inputName === "dosage") {
      newFormData.dosage = inputValue;
    }
    if (inputName === "frequency") {
      newFormData.frequency = inputValue;
    }
    if (inputName === "stock") {
      newFormData.stock = inputValue;
    }
    if (inputName === "refillThreshold") {
      newFormData.refillThreshold = inputValue;
    }

    setFormData(newFormData);
  }

  // Handle a change for a specific time input
  function handleTimeChange(indexToUpdate, newTimeValue) {
    let newFormData = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: [], // We will rebuild the times array
      stock: formData.stock,
      refillThreshold: formData.refillThreshold,
    };

    // Loop through existing times and update the matching index
    for (let i = 0; i < formData.times.length; i++) {
      if (i === indexToUpdate) {
        newFormData.times.push(newTimeValue);
      } else {
        newFormData.times.push(formData.times[i]);
      }
    }

    setFormData(newFormData);
  }

  // Add an extra time slot
  function addTime() {
    let newFormData = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: [],
      stock: formData.stock,
      refillThreshold: formData.refillThreshold,
    };

    // Copy old times
    for (let i = 0; i < formData.times.length; i++) {
      newFormData.times.push(formData.times[i]);
    }

    // Add a new default time
    newFormData.times.push("12:00");

    setFormData(newFormData);
  }

  // Remove a specific time slot
  function removeTime(indexToRemove) {
    let newFormData = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: [],
      stock: formData.stock,
      refillThreshold: formData.refillThreshold,
    };

    // Keep only the times that do not match the index to remove
    for (let i = 0; i < formData.times.length; i++) {
      if (i !== indexToRemove) {
        newFormData.times.push(formData.times[i]);
      }
    }

    setFormData(newFormData);
  }

  // When the user clicks save
  function handleSubmit(event) {
    // Stop the page from reloading
    event.preventDefault();

    // Prepare the final data to save
    let payload = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times,
      stock: parseInt(formData.stock),
      refillThreshold: parseInt(formData.refillThreshold),
    };

    // Check if the numbers are valid, otherwise set to 0
    if (isNaN(payload.stock) === true) {
      payload.stock = 0;
    }
    if (isNaN(payload.refillThreshold) === true) {
      payload.refillThreshold = 0;
    }

    // Save or update via Redux
    if (id !== undefined) {
      payload.id = id;
      dispatch(updateMedicine(payload));
    } else {
      dispatch(addMedicine(payload));
    }

    // Go back to the list
    navigate("/medicines");
  }

  // Draw the time inputs dynamically
  function renderTimeInputs() {
    let timeInputs = [];

    for (let i = 0; i < formData.times.length; i++) {
      let timeValue = formData.times[i];
      let showRemoveButton = false;

      // Only show remove button if there is more than 1 time
      if (formData.times.length > 1) {
        showRemoveButton = true;
      }

      timeInputs.push(
        <div key={i} className="flex gap-3">
          <input
            required
            type="time"
            value={timeValue}
            onChange={function (event) {
              handleTimeChange(i, event.target.value);
            }}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all outline-none color-scheme-dark"
          />
          {showRemoveButton === true && (
            <button
              type="button"
              onClick={function () {
                removeTime(i);
              }}
              className="p-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      );
    }

    return timeInputs;
  }

  // Change text depending on whether we add or edit
  let pageTitle = "Add New Medicine";
  let pageDescription = "Enter the details of your medication to track it automatically.";
  let buttonText = "Save Medication";

  if (id !== undefined) {
    pageTitle = "Edit Medicine";
    pageDescription = "Update the details of your medication.";
    buttonText = "Save Changes";
  }

  let showReminderTimes = false;
  if (formData.frequency !== "As Needed") {
    showReminderTimes = true;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Pill className="text-blue-500 dark:text-blue-400 w-8 h-8" />
          {pageTitle}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {pageDescription}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 border-transparent dark:border-slate-800 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medicine Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dosage</label>
              <input
                required
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g. 500mg"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none appearance-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="As Needed">As Needed</option>
            </select>
          </div>

          {showReminderTimes === true && (
            <div className="space-y-3 p-5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                Reminder Times
              </label>
              
              {renderTimeInputs()}

              <button
                type="button"
                onClick={addTime}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mt-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add another time
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Stock (Pills/Units)</label>
              <input
                required
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="e.g. 30"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Refill Alert Threshold
              </label>
              <input
                required
                type="number"
                min="0"
                name="refillThreshold"
                value={formData.refillThreshold}
                onChange={handleChange}
                placeholder="Alert when stock drops below e.g. 5"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30"
            >
              {buttonText}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMedicine;
