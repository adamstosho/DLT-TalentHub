"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import type { Pagination } from "@/types/common"

interface UseApiOptions {
  immediate?: boolean
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true },
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await api.get(endpoint)
      setState({
        data: response.data.data,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || "An error occurred",
      })
    }
  }

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, [endpoint, options.immediate])

  return {
    ...state,
    refetch: fetchData,
  }
}

interface UsePaginatedApiOptions {
  page?: number
  limit?: number
  immediate?: boolean
}

interface PaginatedApiState<T> {
  data: T[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
}

export function usePaginatedApi<T>(
  endpoint: string,
  options: UsePaginatedApiOptions = {},
): PaginatedApiState<T> & {
  refetch: () => Promise<void>
  setPage: (page: number) => void
  setLimit: (limit: number) => void
} {
  const { page = 1, limit = 10, immediate = true } = options
  const [currentPage, setCurrentPage] = useState(page)
  const [currentLimit, setCurrentLimit] = useState(limit)

  const [state, setState] = useState<PaginatedApiState<T>>({
    data: [],
    pagination: null,
    loading: false,
    error: null,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await api.get(`${endpoint}?page=${currentPage}&limit=${currentLimit}`)
      setState({
        data: response.data.data[Object.keys(response.data.data)[0]] || [],
        pagination: response.data.data.pagination,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      setState({
        data: [],
        pagination: null,
        loading: false,
        error: error.response?.data?.message || "An error occurred",
      })
    }
  }

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [endpoint, currentPage, currentLimit, immediate])

  return {
    ...state,
    refetch: fetchData,
    setPage: setCurrentPage,
    setLimit: setCurrentLimit,
  }
}
