import React, { useState, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";

const cities = [
  { name: "Madrid" },
  { name: "Barcelona" },
  { name: "Ciudad de México" },
  { name: "Buenos Aires" },
  { name: "Lima" },
  { name: "Santiago" },
  { name: "Bogotá" },
  { name: "Miami" },
];

const mockStats = {
  population: "1.5M",
  avgRent: "$750",
  safety: "High",
  climate: "Temperate",
  healthcare: "Good",
  education: "High quality",
  transport: "Efficient",
  expatCommunity: "Active",
  nightlife: "Vibrant",
  internet: "200 Mbps",
  costOfLiving: "Moderate",
  airQuality: "Good",
  greenSpaces: "Plenty",
  walkability: "Excellent",
  jobMarket: "Growing",
  taxes: "Reasonable",
  noiseLevel: "Low",
  traffic: "Moderate",
  weatherConsistency: "Stable",
};

const compareStats = {
  population: "3.3M",
  avgRent: "$950",
  safety: "Medium",
  climate: "Mediterranean",
  healthcare: "Very good",
  education: "Excellent",
  transport: "Very efficient",
  expatCommunity: "Very active",
  nightlife: "Intense",
  internet: "300 Mbps",
  costOfLiving: "High",
  airQuality: "Fair",
  greenSpaces: "Moderate",
  walkability: "Good",
  jobMarket: "Competitive",
  taxes: "High",
  noiseLevel: "Medium",
  traffic: "Heavy",
  weatherConsistency: "Mild",
};

export default function App() {
  const [originCity, setOriginCity] = useState("");
  const [phase, setPhase] = useState("intro");
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [hoverProvince, setHoverProvince] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const globeEl = useRef();

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then((data) => setCountries(data.features));
  }, []);

  const fetchProvinces = async (countryName) => {
    const slug = countryName
      .toLowerCase()
      .replace(/\s/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    try {
      const res = await fetch(`/livably/geo/provincias/${slug}.geojson`);
      const data = await res.json();
      const featuresWithNombre = data.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          nombre:
            f.properties.NAME_2 ||
            f.properties.name ||
            f.properties.state_name ||
            "Unnamed",
        },
      }));
      setProvinces(featuresWithNombre);
    } catch (err) {
      console.error("Could not load provinces for", countryName);
      setProvinces([]);
    }
  };

  const startExploring = () => {
    if (originCity) setPhase("globe");
  };

  const onCountryClick = (d) => {
    const countryName = d.properties.name;
    setSelectedCountry(countryName);
    fetchProvinces(countryName);
    setPhase("clouds");
  };

  const goBackToCountries = () => {
    setPhase("globe");
    setSelectedProvince(null);
    setProvinces([]);
  };

  useEffect(() => {
    if (phase === "clouds" && selectedCountry) {
      const country = countries.find(
        (c) => c.properties.name === selectedCountry
      );
      if (!country) return;

      const coordinates = country.geometry.coordinates.flat(Infinity);
      const lats = coordinates.filter((_, i) => i % 2 === 1);
      const lngs = coordinates.filter((_, i) => i % 2 === 0);
      const latCenter = lats.reduce((a, b) => a + b, 0) / lats.length;
      const lngCenter = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      globeEl.current.pointOfView({ lat: latCenter, lng: lngCenter, altitude: 0.8 }, 2000);

      const timer = setTimeout(() => setPhase("provinces"), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, selectedCountry, countries]);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-700 ${
        phase === "intro"
          ? "bg-gradient-to-br from-purple-200 to-blue-300 p-6 flex items-center justify-center"
          : "bg-gray-900"
      }`}
    >
      {phase === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <h1 className="text-5xl font-extrabold text-purple-800 mb-6 drop-shadow-md">
            LIVABLY
          </h1>
          <p className="text-gray-700 mb-8 text-lg">
            Choose your origin city to start your journey
          </p>
          <select
            className="w-full p-4 rounded-xl border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg mb-8"
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
          >
            <option value="" disabled>
              Select your city
            </option>
            {cities.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={startExploring}
            disabled={!originCity}
            className={`w-full py-4 rounded-xl text-white font-semibold transition ${
              originCity
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-purple-300 cursor-not-allowed"
            }`}
          >
            Start
          </button>
        </motion.div>
      )}

      {(phase === "globe" || phase === "clouds" || phase === "provinces") && (
        <div className="relative w-full h-screen">
          {/* Tooltip box */}
          <div className="absolute top-6 left-6 z-20 bg-gradient-to-br from-purple-200 to-blue-300 rounded-xl p-4 text-gray-900 max-w-xs shadow-lg">
            {phase === "globe" && (
              <>
                <h2 className="text-xl font-bold mb-1">Explore Countries</h2>
                <p>Hover to lift a country, click to select</p>
              </>
            )}
            {phase === "clouds" && (
              <>
                <h2 className="text-xl font-bold mb-1">
                  Entering {selectedCountry}
                </h2>
                <p>Cloud animation and zoom...</p>
              </>
            )}
            {phase === "provinces" && (
              <>
                <h2 className="text-xl font-bold mb-1">
                  Provinces of {selectedCountry}
                </h2>
                <p>Hover to lift a province, click to select</p>
              </>
            )}
          </div>

          {/* Go back button */}
          {phase === "provinces" && (
            <button
              onClick={goBackToCountries}
              className="absolute top-6 right-6 z-20 bg-gradient-to-br from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg font-semibold hover:brightness-110 transition"
            >
              ← Back to Countries
            </button>
          )}

          {/* Bottom Sheet info panel */}
          <AnimatePresence>
            {selectedProvince && (
              <>
                {/* Overlay */}
                <motion.div
                  key="overlay"
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedProvince(null)}
                />

                {/* Bottom Sheet */}
                <motion.div
                  key="bottom-sheet"
                  className="fixed bottom-0 left-0 right-0 max-h-[90vh] md:max-h-[70vh] bg-white rounded-t-3xl shadow-xl z-50 p-6 md:max-w-xl md:left-1/2 md:-translate-x-1/2 overflow-y-auto"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedProvince.properties.nombre}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFlipped((f) => !f)}
                        aria-label="Flip card"
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                      >
                        <RotateCcw className="w-6 h-6 text-gray-700" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProvince(null);
                          setFlipped(false);
                        }}
                        aria-label="Close panel"
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                      >
                        <X className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {!flipped ? (
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                      {Object.entries(mockStats).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="font-semibold capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full text-gray-700 border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2">Metric</th>
                          <th className="border border-gray-300 p-2">
                            {selectedProvince.properties.nombre}
                          </th>
                          <th className="border border-gray-300 p-2">{originCity}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(mockStats).map((key) => (
                          <tr key={key} className="even:bg-gray-50">
                            <td className="border border-gray-300 p-2 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </td>
                            <td className="border border-gray-300 p-2">{mockStats[key]}</td>
                            <td className="border border-gray-300 p-2">
                              {compareStats[key]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <Globe
            ref={globeEl}
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundColor="rgba(0,0,0,0)"
            polygonsData={
              phase === "provinces"
                ? provinces
                : phase === "clouds" || phase === "globe"
                ? countries
                : []
            }
            polygonAltitude={(d) =>
              phase === "provinces"
                ? d === hoverProvince
                  ? 0.015
                  : 0.008
                : d === hoverD
                ? 0.025
                : 0.01
            }
            polygonCapColor={(d) =>
              d === (phase === "provinces" ? hoverProvince : hoverD)
                ? "#66bb6a"
                : "#388e3c"
            }
            polygonSideColor={() => "rgba(34, 139, 34, 0.2)"}
            polygonStrokeColor={() => "#444"}
            polygonStrokeWidth={0.4}
            polygonsTransitionDuration={300}
            onPolygonHover={phase === "provinces" ? setHoverProvince : setHoverD}
            onPolygonClick={(d) => {
              if (phase === "globe") {
                onCountryClick(d);
              } else if (phase === "provinces") {
                setSelectedProvince(d);
                setFlipped(false);
              }
            }}
            polygonsFilter={() => true}
            enableRotate={false}
            enablePan={false}
            enableZoom={true}
          />

          <AnimatePresence>
            {phase === "clouds" && (
              <motion.div
                key="clouds"
                className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
