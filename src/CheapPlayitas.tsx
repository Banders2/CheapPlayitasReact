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
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [selectedDurations, setDurations] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/prices?MaxPrice7=100000&MaxPrice14=100000&persons=&PlayitasAnnexe=true&PlayitasResort=true&airportcph=true&airportbll=true');
        const json: TravelData[] = await response.json();
        setTravelData(json);
        setFilteredData(json);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Rest of your code...

  // const baseUrl = 'http://localhost:5000/api/prices';
  // const hotels = ["PlayitasAnnexe", "PlayitasResort"]
  // const fetchUrls: string[] = [];
  // hotels.forEach( hotel => {
  //   const queryParams = `MaxPrice7=&MaxPrice14=15000&persons=&${hotel}=true&airportcph=true&airportbll=true`;
  //   const url = `${baseUrl}?${queryParams}`;
  //   fetchUrls.push(url);
  // })

  // const fetchPromises = fetchUrls.map((url) => fetch(url));
  // Promise.all(fetchPromises)
  //   .then((responses) => Promise.all(responses.map((response) => response.json())))
  //   .then((jsonData) => {
  //     // Merge the travel data from all responses
  //     const mergedData = jsonData.reduce((accumulator, data) => accumulator.concat(data), []);

  //     setTravelData(mergedData);
  //     setFilteredData(mergedData);
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching data:', error);
  //   });





  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, column: string) => {
    const value = event.target.value;

    if (event.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(event.target.options)
        .filter((option) => option.selected && option.value !== '')
        .map((option) => option.value);
      switch (column) {
        case 'Date':
          setSelectedMonths(selectedOptions);
          break;
        case 'Airport':
          setSelectedAirports(selectedOptions)
          break;
        case 'Hotel':
          setSelectedHotels(selectedOptions)
          break;
        case 'Duration':
          setDurations(selectedOptions)
          break;
        default:
          break;
      }
    } else if (column === 'CheapestPrice') {
      const numericValue = parseFloat(value);
      setMaxPrice(isNaN(numericValue) ? Infinity : numericValue);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, maxPrice, selectedMonths, selectedAirports, selectedHotels, selectedDurations]);

  const applyFilters = () => {
    let filteredResults = [...travelData];
    filteredResults = filteredResults.filter((item) =>
      item['CheapestPrice'] <= maxPrice
    );

    if (selectedMonths.length > 0) {filteredResults = filteredResults.filter((item) => {return selectedMonths.includes(item.Date.substring(0, 7));});}
    if (selectedAirports.length > 0) { filteredResults = filteredResults.filter((item) => { return selectedAirports.includes(item.Airport); }); }
    if (selectedHotels.length > 0) { filteredResults = filteredResults.filter((item) => { return selectedHotels.includes(item.Hotel); }); }
    if (selectedDurations.length > 0) { filteredResults = filteredResults.filter((item) => { return selectedDurations.includes(item.Duration); }); }

    setFilteredData(filteredResults);
  };

  const getUniqueSortedValues = <T, K extends keyof T>(data: T[], getProperty: (item: T) => T[K]): string[] => {
    return [...new Set(data.map(getProperty))].sort() as string[];
  };

  const uniqueHotels = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.Hotel);
  const uniqueAirports = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.Airport);
  const uniqueDurations = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.Duration);
  const uniqueYearMonthCombinations = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.Date.substring(0, 7));

  return (
    <div>
      <h1 className={styles.blue}>Flight Prices</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            {DropdownList(selectedAirports, uniqueAirports, 'Airport')}
            {LessThan('CheapestPrice')}
            {DropdownList(selectedMonths, uniqueYearMonthCombinations, 'Date')}
            {DropdownList(selectedDurations, uniqueDurations, 'Duration')}
            {DropdownList(selectedHotels, uniqueHotels, 'Hotel')}
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

  function LessThan(columnName: string) {
    return <th className={styles.cell}>
      <input
        type="number"
        placeholder="Enter Max Price"
        value={maxPrice === Infinity ? '' : maxPrice}
        onChange={(e) => handleFilterChange(e, columnName)} />
    </th>;
  }

  function DropdownList(selectedList: string[], uniqueList: string[], columnName: string) {
    return <th className={styles.cell}>
      <select
        className={styles.filterInput}
        value={selectedList.length === uniqueList.length ? '' : selectedList}
        onChange={(e) => handleFilterChange(e, columnName)}
        multiple
      >
        <option value="">All {columnName}s</option>
        {uniqueList.map((element) => (
          <option key={element} value={element}>
            {element}
          </option>
        ))}
      </select>
    </th>;
  }
};

export default CheapPlayitas;
