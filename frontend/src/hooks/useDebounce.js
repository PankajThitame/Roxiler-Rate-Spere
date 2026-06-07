import { useRef, useEffect } from 'react'

export default function useDebounce(value, delay = 300) {
  const handlerRef = useRef(null)

  useEffect(() => {
    handlerRef.current = setTimeout(() => {}, 0)
    return () => {
      if (handlerRef.current) clearTimeout(handlerRef.current)
    }
  }, [])

  const setDebounced = (fn) => {
    if (handlerRef.current) clearTimeout(handlerRef.current)
    handlerRef.current = setTimeout(fn, delay)
  }

  return setDebounced
}
