import React, { useState, useEffect } from 'react';
import styles from './CheapPlayitas.module.css';

interface TravelData {
  Airport: string;
  CheapestPrice: number;
  Date: string;
  Duration: string;
  Hotel: string;
  IsSoldOut: boolean;
  Link: string;
  [key: string]: string | number | boolean; // Index signature
}


const CheapPlayitas: React.FC = () => {
  const [travelData, setTravelData] = useState<TravelData[]>([]);
  const [filteredData, setFilteredData] = useState<TravelData[]>([]);
  const [filters, setFilters] = useState<{ column: string; value: string }[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/prices?MaxPrice7=&MaxPrice14=15000&persons=&PlayitasAnnexe=true&PlayitasResort=true&airportcph=true&airportbll=true');
        const json: TravelData[] = await response.json();
        setTravelData(json);
        setFilteredData(json);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, column: string) => {
    const value = event.target.value;

    if (column === 'Date' && event.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(event.target.options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setSelectedMonths(selectedOptions);
    } else if (column === 'CheapestPrice') {
      const numericValue = parseFloat(value);
      setMaxPrice(isNaN(numericValue) ? Infinity : numericValue);
    } else {

      // Check if the filter already exists
      const filterIndex = filters.findIndex((filter) => filter.column === column);

      // If the filter exists, update the value; otherwise, add a new filter
      if (filterIndex !== -1) {
        const updatedFilters = [...filters];
        updatedFilters[filterIndex] = { column, value };
        setFilters(updatedFilters);
      } else {
        setFilters([...filters, { column, value }]);
      }
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, maxPrice, selectedMonths]);

  const applyFilters = () => {
    let filteredResults = [...travelData];

    // filteredResults = filteredResults.filter((item) => {
    //   const itemValue = String(item.CheapestPrice).toLowerCase();
    //   const numericValue = parseFloat(itemValue);
    //   return !isNaN(numericValue) && numericValue <= maxPrice;
    // });

    filters.forEach((filter) => {
      const { column, value } = filter;
      if (column === 'Hotel' || column === 'Airport') {
        filteredResults = filteredResults.filter((item) =>
          item[column].toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    filteredResults = filteredResults.filter((item) =>
      item['CheapestPrice'] <= maxPrice
    );

    if (selectedMonths.length > 0) {
      filteredResults = filteredResults.filter((item) => {
        const itemMonthYear = item.Date.substring(0,7);
        return selectedMonths.includes(itemMonthYear);
      });
    }

    setFilteredData(filteredResults);
  };

  const uniqueHotels = [...new Set(travelData.map((item) => item.Hotel))];
  const uniqueAirports = [...new Set(travelData.map((item) => item.Airport))];
  const uniqueDurations = [...new Set(travelData.map((item) => item.Duration))];
  const uniqueYearMonthCombinations = [...new Set(travelData.map((item) => item.Date.substring(0, 7)))];



  return (
    <div>
      <h1 className={styles.blue}>Flight Prices</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.cell}>
              <select
                className={styles.filterInput}
                value={filters.find((filter) => filter.column === 'Airport')?.value || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(e, 'Airport')}
              >
                <option value="">Filter by Airport</option>
                {uniqueAirports.map((airport) => (
                  <option key={airport} value={airport}>
                    {airport}
                  </option>
                ))}
              </select>
            </th>
            <th className={styles.cell}>
              <input
                type="number"
                placeholder="Filter by Cheapest Price"
                value={maxPrice === Infinity ? '' : maxPrice}
                onChange={(e) => handleFilterChange(e, 'CheapestPrice')}
              />
            </th>
            <th className={styles.cell}>
              <select
                className={styles.filterInput}
                multiple
                value={selectedMonths}
                onChange={(e) => handleFilterChange(e, 'Date')}
              >
                <option value="">Filter by Date</option>
                {uniqueYearMonthCombinations.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </th>
            <th className={styles.cell}>
              <select
                className={styles.filterInput}
                value={filters.find((filter) => filter.column === 'Duration')?.value || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(e, 'Duration')}
              >
                <option value="">Filter by Duration</option>
                {uniqueDurations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </th>
            <th className={styles.cell}>
              <select
                className={styles.filterInput}
                value={filters.find((filter) => filter.column === 'Hotel')?.value || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(e, 'Hotel')}
              >
                <option value="">Filter by Hotel</option>
                {uniqueHotels.map((hotel) => (
                  <option key={hotel} value={hotel}>
                    {hotel}
                  </option>
                ))}
              </select>
            </th>
            <th className={styles.cell}>Link</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? styles.evenRow : ''}>
              <td className={styles.cell}>{item.Airport}</td>
              <td className={styles.cell}>{item.CheapestPrice}</td>
              <td className={styles.cell}>{item.Date}</td>
              <td className={styles.cell}>{item.Duration}</td>
              <td className={styles.cell}>{item.Hotel}</td>
              <td className={styles.cell}>
                <a href={item.Link} target="_blank" rel="noopener noreferrer">
                  View Details
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheapPlayitas;
