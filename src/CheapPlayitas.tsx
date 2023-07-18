/* eslint-disable multiline-ternary */
import React, { useState, useEffect } from 'react'
import styles from './CheapPlayitas.module.css'
import Select from 'react-select'

const Spinner = (): JSX.Element => (
  <div className={styles.spinner}>
    <div className={styles.spinnerInner}></div>
  </div>
)

interface ColumnData {
  columnName: string
  headerText: string
}

interface TravelData {
  airport: string
  price: string
  date: string
  duration: string
  hotel: string
  link: string
  [key: string]: string
}

const CheapPlayitas: React.FC = () => {
  const [travelData, setTravelData] = useState<TravelData[]>([])
  const [filteredData, setFilteredData] = useState<TravelData[]>([])
  const [filters, setFilters] = useState<
    Array<{ column: string; value: string[] }>
  >([])
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [sortCriteria, setSortCriteria] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true)

        const response = await fetch(
          'https://cheapplayitasapi.azurewebsites.net/api/prices'
        )
        const json: TravelData[] = await response.json()

        setTravelData(json)
        setFilteredData(json)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [])

  const handleFilterChange = ({
    column,
    event,
    selectedOptions,
  }: {
    column: string
    event?: React.ChangeEvent<HTMLInputElement>
    selectedOptions?: unknown
  }): void => {
    if (selectedOptions !== undefined) {
      const selectedValues = Array.isArray(selectedOptions)
        ? selectedOptions.map((option) => option.value)
        : []

      const existingFilterIndex = filters.findIndex(
        (filter) => filter.column === column
      )
      if (existingFilterIndex > -1) {
        const updatedFilters = [...filters]
        updatedFilters[existingFilterIndex].value = selectedValues
        setFilters(updatedFilters)
      } else {
        setFilters([...filters, { column, value: selectedValues }])
      }
    } else if (event !== undefined) {
      const value = event.target.value
      if (column === 'price') {
        setMaxPrice(value !== '' ? parseFloat(value) : undefined)
      }
    }
  }

  useEffect(() => {
    const applyFilters = (): void => {
      let filteredResults = [...travelData]
      if (maxPrice !== undefined) {
        filteredResults = filteredResults.filter(
          (item) => parseFloat(item.price) <= maxPrice
        )
      }

      filters.forEach((filter) => {
        const { column, value } = filter
        if (column === 'date') {
          if (value.length > 0) {
            filteredResults = filteredResults.filter((item) =>
              value.includes(item[column].substring(0, 7))
            )
          }
        } else {
          if (value.length > 0) {
            filteredResults = filteredResults.filter((item) =>
              value.includes(String(item[column]))
            )
          }
        }
      })

      sortData(filteredResults, sortCriteria, sortOrder)

      setFilteredData(filteredResults)
    }

    applyFilters()
  }, [maxPrice, filters, travelData, sortCriteria, sortOrder])

  function sortData(
    filteredResults: TravelData[],
    sortCriteria: string,
    sortOrder: string
  ): void {
    filteredResults.sort((a, b) => {
      const valueA =
        sortCriteria === 'date'
          ? new Date(a.date).getTime()
          : parseFloat(a.price)
      const valueB =
        sortCriteria === 'date'
          ? new Date(b.date).getTime()
          : parseFloat(b.price)

      if (sortOrder === 'asc') {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })
  }

  const getUniqueSortedValues = <T, K extends keyof T>(
    data: T[],
    getProperty: (item: T) => T[K]
  ): string[] => {
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    return [...new Set(data.map(getProperty))].sort() as string[]
  }

  const getUniqueSortedNumberValues = <T, K extends keyof T>(
    data: T[],
    getProperty: (item: T) => T[K]
  ): string[] => {
    return [...new Set(data.map(getProperty))]
      .sort((a, b) => Number(a) - Number(b))
      .map(String)
  }

  const columnData: ColumnData[] = [
    { columnName: 'airport', headerText: 'Airport' },
    { columnName: 'price', headerText: 'Price' },
    { columnName: 'date', headerText: 'Date' },
    { columnName: 'duration', headerText: 'Duration' },
    { columnName: 'hotel', headerText: 'Hotel' },
  ]

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <React.Fragment>
          <h1 className={styles.blue}>Flight Prices</h1>
          <table className={styles.table}>
            <thead>
              <tr>
                {columnData.map((column) => (
                  <th key={column.columnName} className={styles.cell}>
                    <div className={styles.columnHeader}>
                      <div>
                        {column.headerText}
                        {column.columnName === 'date' && sortButton('date')}
                        {column.columnName === 'price' && sortButton('price')}
                      </div>
                    </div>
                    {column.columnName === 'price' ? (
                      <div className={styles.filterInput}>
                        <input
                          type="number"
                          placeholder="Enter Max Price"
                          value={
                            maxPrice !== undefined ? maxPrice.toString() : ''
                          }
                          onChange={(e) => {
                            handleFilterChange({ column: 'price', event: e })
                          }}
                        />
                      </div>
                    ) : (
                      <DropdownList column={column.columnName} />
                    )}
                  </th>
                ))}
                <th className={styles.cell}>Link</th>{' '}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? styles.evenRow : ''}
                >
                  <td className={styles.cell}>{item.airport}</td>
                  <td className={styles.cell}>{item.price}</td>
                  <td className={styles.cell}>{item.date.substring(0, 10)}</td>
                  <td className={styles.cell}>{item.duration}</td>
                  <td className={styles.cell}>{item.hotel}</td>
                  <td className={styles.cell}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </React.Fragment>
      )}
    </div>
  )

  function DropdownList({ column }: { column: string }): JSX.Element {
    let uniqueValues: string[]
    if (column === 'date') {
      uniqueValues = getUniqueSortedValues<TravelData, string>(
        travelData,
        (item) => item[column].substring(0, 7)
      )
    } else if (column === 'duration') {
      uniqueValues = getUniqueSortedNumberValues<TravelData, string>(
        travelData,
        (item) => item[column]
      )
    } else {
      uniqueValues = getUniqueSortedValues<TravelData, string>(
        travelData,
        (item) => item[column]
      )
    }

    const selectedList = filters.find((x) => x.column === column)?.value

    return (
      <Select
        className={styles.filterInput}
        value={
          selectedList != null
            ? selectedList.map((value) => ({ value, label: value }))
            : []
        }
        options={uniqueValues.map((value) => ({ value, label: value }))}
        isMulti
        onChange={(selectedOptions) => {
          handleFilterChange({ column, selectedOptions })
        }}
        isSearchable={false}
      />
    )
  }

  function sortButton(columnName: string): React.ReactNode {
    return sortCriteria === columnName ? (
      <button
        className={styles.sortButton}
        onClick={() => {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        }}
      >
        {sortOrder === 'asc' ? '▲' : '▼'}
      </button>
    ) : (
      <button
        className={styles.sortButton}
        onClick={() => {
          setSortCriteria(columnName)
          setSortOrder('asc')
        }}
      >
        ▶
      </button>
    )
  }
}

export default CheapPlayitas
