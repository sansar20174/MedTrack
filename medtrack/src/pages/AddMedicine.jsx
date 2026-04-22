import { useState } from "react";
import { useDispatch } from "react-redux";
import { addMedicine } from "../redux/medicineSlice";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pill, Clock, AlertTriangle, ArrowRight } from "lucide-react";

function AddMedicine() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    times: ["08:00"],
    stock: "",
    refillThreshold: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData((prev) => ({ ...prev, times: newTimes }));
  };

  const addTime = () => {
    setFormData((prev) => ({ ...prev, times: [...prev.times, "12:00"] }));
  };

  const removeTime = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, times: newTimes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      addMedicine({
        ...formData,
        stock: parseInt(formData.stock) || 0,
        refillThreshold: parseInt(formData.refillThreshold) || 0,
      })
    );
    navigate("/medicines");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Pill className="text-blue-500 w-8 h-8" />
          Add New Medicine
        </h1>
        <p className="text-slate-500 mt-2">Enter the details of your medication to track it automatically.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Medicine Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dosage</label>
              <input
                required
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g. 500mg"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="As Needed">As Needed</option>
            </select>
          </div>

          {formData.frequency !== "As Needed" && (
            <div className="space-y-3 p-5 rounded-xl bg-blue-50/50 border border-blue-100">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Reminder Times
              </label>
              {formData.times.map((time, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    required
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
              >
                <Plus className="w-4 h-4" /> Add another time
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Current Stock (Pills/Units)</label>
              <input
                required
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="e.g. 30"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
            >
              Save Medication
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMedicine;
