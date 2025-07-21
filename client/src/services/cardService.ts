import type { Card } from '@/types/card'

const API_URL = import.meta.env.VITE_API_URL

export async function fetchCards(): Promise<Card[]> {
  const response = await fetch(`${API_URL}/cards`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  })
  return await response.json()
}

export async function loadExampleCards(): Promise<Card[]> {
  const response = await fetch(`${API_URL}/cards/load-example`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  })
  return await response.json()
}

export async function clearCards(): Promise<void> {
  await fetch(`${API_URL}/cards`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  })
}
