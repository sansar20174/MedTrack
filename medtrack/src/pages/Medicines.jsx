import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { deleteMedicine } from "../redux/medicineSlice";
import { Trash2, Pill, AlertCircle, Plus, Activity, CalendarClock } from "lucide-react";

function Medicines() {
  const medicines = useSelector(function (state) {
    return state.medicines.medicines;
  });
  const dispatch = useDispatch();

  function handleDelete(id) {
    let userWantsToDelete = window.confirm("Are you sure you want to delete this medication?");
    if (userWantsToDelete === true) {
      dispatch(deleteMedicine(id));
    }
  }

  function renderMedicineCards() {
    let cards = [];

    for (let i = 0; i < medicines.length; i++) {
      let med = medicines[i];
      let isLowStock = false;

      // Check if we are low on stock
      if (med.stock <= med.refillThreshold) {
        isLowStock = true;
      }

      // Calculate how many pills we take per day
      let pillsPerDay = 0;
      if (med.frequency === "Daily") {
        pillsPerDay = med.times.length;
      } else if (med.frequency === "Weekly") {
        pillsPerDay = med.times.length / 7;
      }

      // Estimate when we will run out
      let refillDateStr = "N/A";
      let daysLeftStr = "Unknown";

      if (pillsPerDay > 0) {
        let daysLeft = Math.floor(med.stock / pillsPerDay);
        daysLeftStr = daysLeft + " days";
        
        let refillDate = new Date();
        refillDate.setDate(refillDate.getDate() + daysLeft);
        refillDateStr = refillDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      // Prepare styles depending on stock level
      let iconBackgroundClass = "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400";
      let stockNumberClass = "text-slate-700 dark:text-slate-300";

      if (isLowStock === true) {
        iconBackgroundClass = "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500";
        stockNumberClass = "text-amber-600 dark:text-amber-500";
      }

      // Render the times as small tags
      let timeTags = [];
      if (med.frequency !== "As Needed") {
        for (let j = 0; j < med.times.length; j++) {
          timeTags.push(
            <span key={j} className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
              {med.times[j]}
            </span>
          );
        }
      }

      cards.push(
        <div key={med.id} className="glass-panel rounded-2xl p-6 relative group overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
          
          {isLowStock === true && (
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={"p-3 rounded-xl " + iconBackgroundClass}>
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{med.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{med.dosage}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to={"/edit-medicine/" + med.id}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
              </Link>
              <button
                onClick={function () { handleDelete(med.id); }}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Frequency</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{med.frequency}</span>
            </div>

            {med.frequency !== "As Needed" && (
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-500 dark:text-slate-400">Times</span>
                <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                  {timeTags}
                </div>
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Stock Remaining</span>
                <div className="flex items-center gap-2">
                  {isLowStock === true && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={"font-bold text-lg " + stockNumberClass}>
                    {med.stock} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">units</span>
                  </span>
                </div>
              </div>

              {pillsPerDay > 0 && (
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    Est. Refill Date
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {refillDateStr} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({daysLeftStr})</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return cards;
  }

  // Show a message if there are no medicines
  let hasNoMedicines = false;
  if (medicines.length === 0) {
    hasNoMedicines = true;
  }

  return (
    <div className="animate-fade-in transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Activity className="text-indigo-500 dark:text-indigo-400 w-8 h-8" />
            My Medicines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your medications and check their current stock.</p>
        </div>
        <Link
          to="/add-medicine"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/30 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add New
        </Link>
      </div>

      {hasNoMedicines === true ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No medicines added yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Start tracking your medications by adding your first one.</p>
          <Link
            to="/add-medicine"
            className="inline-flex bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            Add Medicine
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMedicineCards()}
        </div>
      )}
    </div>
  );
}

export default Medicines;