import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import jest from 'jest-mock'
import { usePolicyholderStore } from '@/stores/policyholder'
import * as api from '@/apis'

vi.mock('@/apis')

describe('Policyholder Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with correct default values', () => {
    const store = usePolicyholderStore()
    expect(store.code).toBe('')
    expect(store.root).toEqual({})
    expect(store.loading).toBe(false)
  })

  it('transforms policyholder data correctly', async () => {
    const store = usePolicyholderStore()
    const mockData = {
      name: '保戶1',
      code: '0000000001',
      l: {
        name: '保戶2',
        code: '0000000002',
        introducer_code: '0000000001',
        l: {
          name: '保戶4',
          code: '0000000004',
          introducer_code: '0000000001',
        }
      },
      r: {
        name: '保戶3',
        code: '0000000003',
        introducer_code: '0000000001',
      },
    }
      ; (api.getPolicyholders as jest.Mock).mockResolvedValue(mockData)

    await store.load('0000000001')

    expect(store.root).toEqual({
      label: '保戶1',
      code: '0000000001',
      expand: true,
      type: 'root',
      children: [
        {
          label: '保戶2',
          code: '0000000002',
          expand: true,
          type: 'direct',
          children: [
            {
              label: '保戶4',
              code: '0000000004',
              expand: true,
              type: 'indirect',
            },
          ]
        },
        {
          label: '保戶3',
          code: '0000000003',
          expand: true,
          type: 'direct',
        },
      ],
    })
  })

  it('sets loading state correctly during API call', async () => {
      const store = usePolicyholderStore()
      const mockData = { name: '保戶1', code: '0000000001' }
      ;(api.getPolicyholders as jest.Mock).mockResolvedValue(mockData)

      const loadPromise = store.load('0000000001')

      expect(store.loading).toBe(true)

      await loadPromise

      expect(store.loading).toBe(false)
  })

  it('handles API errors correctly', async () => {
      const store = usePolicyholderStore()
      const mockError = new Error('API Error')
      ;(api.getPolicyholders as jest.Mock).mockRejectedValue(mockError)

      await expect(store.load('0000000001')).rejects.toThrow('API Error')
      expect(store.loading).toBe(false)
  })
})
