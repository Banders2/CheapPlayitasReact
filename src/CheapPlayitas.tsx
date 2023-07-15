import React, { useState, useEffect } from 'react';
import styles from './CheapPlayitas.module.css';

interface TravelData {
  airport: string;
  price: string;
  date: string;
  duration: string;
  hotel: string;
  link: string;
  [key: string]: string; // Index signature
}


const CheapPlayitas: React.FC = () => {
  const [travelData, setTravelData] = useState<TravelData[]>([]);
  const [filteredData, setFilteredData] = useState<TravelData[]>([]);
  const [filters, setFilters] = useState<{ column: string; value: string[] }[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [sortCriteria, setSortCriteria] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('https://localhost:7291/api/prices');
        const response = await fetch('https://cheapplayitasapi.azurewebsites.net/api/prices');
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

    if (event.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(event.target.options)
        .filter((option) => option.selected && option.value !== '')
        .map((option) => option.value);
      const existingFilterIndex = filters.findIndex((filter) => filter.column === column);

      if (existingFilterIndex > -1) {
        const updatedFilters = [...filters];
        updatedFilters[existingFilterIndex].value = selectedOptions;

        setFilters(updatedFilters);
      } else {
        setFilters([...filters, { column, value: selectedOptions }]);
      }
    } else if (column === 'price') {
      const numericValue = parseFloat(value);
      setMaxPrice(isNaN(numericValue) ? Infinity : numericValue);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [maxPrice, filters, travelData, sortCriteria, sortOrder]);

  const applyFilters = () => {
    let filteredResults = [...travelData];
    filteredResults = filteredResults.filter((item) =>
      parseFloat(item['price']) <= maxPrice
    );

    filters.forEach((filter) => {
      const { column, value } = filter;
      if (column === 'date') {
        if (value.length > 0) {
          filteredResults = filteredResults.filter((item) => value.includes(item[column].substring(0, 7)));
        }
      } else {
        if (value.length > 0) {
          filteredResults = filteredResults.filter((item) => value.includes(String(item[column])));
        }
      }
    });

    sortData(filteredResults, sortCriteria, sortOrder);

    setFilteredData(filteredResults);
  };

  function sortData(filteredResults: TravelData[], sortCriteria: string, sortOrder: string) {
    filteredResults.sort((a, b) => {
      const valueA = sortCriteria === 'date' ? new Date(a.date).getTime() : parseFloat(a.price);
      const valueB = sortCriteria === 'date' ? new Date(b.date).getTime() : parseFloat(b.price);

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  const getUniqueSortedValues = <T, K extends keyof T>(data: T[], getProperty: (item: T) => T[K]): string[] => {
    return [...new Set(data.map(getProperty))].sort() as string[];
  };

  const getUniqueSortedNumberValues = <T, K extends keyof T>(data: T[], getProperty: (item: T) => T[K]): string[] => {
    return [...new Set(data.map(getProperty))]
      .sort((a, b) => Number(a) - Number(b))
      .map(String);
  };

  const uniqueHotels = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.hotel);
  const uniqueAirports = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.airport);
  const uniqueDurations = getUniqueSortedNumberValues<TravelData, string>(travelData, (item) => item.duration);
  const uniqueYearMonthCombinations = getUniqueSortedValues<TravelData, string>(travelData, (item) => item.date.substring(0, 7));

  return (
    <div>
      <h1 className={styles.blue}>Flight Prices</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            {DropdownList(uniqueAirports, 'airport')}
            {MaxValue('price')}
            {DropdownListWithSort(uniqueYearMonthCombinations, 'date')}
            {DropdownList(uniqueDurations, 'duration')}
            {DropdownList(uniqueHotels, 'hotel')}
            <th className={styles.cell}>Link</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? styles.evenRow : ''}>
              <td className={styles.cell}>{item.airport}</td>
              <td className={styles.cell}>{item.price}</td>
              <td className={styles.cell}>{item.date.substring(0, 10)}</td>
              <td className={styles.cell}>{item.duration}</td>
              <td className={styles.cell}>{item.hotel}</td>
              <td className={styles.cell}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  View Details
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function MaxValue(columnName: string) {
    return <th className={styles.cell}>
      <input
        type="number"
        placeholder="Enter Max Price"
        value={maxPrice === Infinity ? '' : maxPrice}
        onChange={(e) => handleFilterChange(e, columnName)} />
      {
        sortButton(columnName)
      }
    </th>;
  }

  function DropdownList(uniqueList: string[], columnName: string) {
    let selectedList = filters.find(x => x.column === columnName)?.value
    return <th className={styles.cell}>
      {DropdownListUi(selectedList, uniqueList, columnName)}
    </th>;
  }

  function DropdownListWithSort(uniqueList: string[], columnName: string) {
    let selectedList = filters.find(x => x.column === columnName)?.value
    return <th className={styles.cell}>
      {DropdownListUi(selectedList, uniqueList, columnName)}
      {
        sortButton(columnName)
      }
    </th>;
  }

  function DropdownListUi(selectedList: string[] | undefined, uniqueList: string[], columnName: string) {
    return <select
      className={styles.filterInput}
      value={selectedList?.length === uniqueList.length ? '' : selectedList}
      onChange={(e) => handleFilterChange(e, columnName)}
      multiple
    >
      <option value="">All {columnName}s</option>
      {uniqueList.map((element) => (
        <option key={element} value={element}>
          {element}
        </option>
      ))}
    </select>;
  }

  function sortButton(columnName: string): React.ReactNode {
    return sortCriteria === columnName ? (
      <button
        className={styles.sortButton}
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? '▲' : '▼'}
      </button>
    ) : (
      <button
        className={styles.sortButton}
        onClick={() => {
          setSortCriteria(columnName);
          setSortOrder('asc');
        }}
      >
        Sort
      </button>
    );
  }
};

export default CheapPlayitas;