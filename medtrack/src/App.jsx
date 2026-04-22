import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddMedicine from "./pages/AddMedicine";
import Medicines from "./pages/Medicines";
import ApiData from "./pages/ApiData";
import MedicineSearch from "./components/MedicineSearch";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-medicine" element={<AddMedicine />} />
            <Route path="/edit-medicine/:id" element={<AddMedicine />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/api-data" element={<ApiData />} />
            <Route path="/medicine-search" element={<MedicineSearch />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;