import { useState, useEffect } from "react";
import axios from "axios";

function MedicineSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // ⏳ Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // 🌐 API Call
    useEffect(() => {
        if (!debouncedQuery) return;

        setLoading(true);

        axios
            .get(
                `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${debouncedQuery}&limit=1`
            )
            .then((res) => {
                setData(res.data.results[0]);
                setLoading(false);
            })
            .catch(() => {
                setData(null);
                setLoading(false);
            });
    }, [debouncedQuery]);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Medicine Info Search 💊</h1>

            <input
                type="text"
                placeholder="Enter medicine name..."
                className="border p-2 w-full mb-4 rounded"
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading && <p>Loading...</p>}

            {data && (
                <div className="border p-4 rounded shadow">
                    <h2 className="font-bold text-lg mb-2">
                        {data.openfda?.brand_name?.[0]}
                    </h2>

                    <p>
                        <strong>Purpose:</strong>{" "}
                        {data.purpose?.[0] || "Not available"}
                    </p>

                    <p>
                        <strong>Warnings:</strong>{" "}
                        {data.warnings?.[0] || "Not available"}
                    </p>

                    <p>
                        <strong>Dosage:</strong>{" "}
                        {data.dosage_and_administration?.[0] || "Not available"}
                    </p>
                </div>
            )}
        </div>
    );
}

export default MedicineSearch;
