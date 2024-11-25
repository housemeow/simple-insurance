import { defineStore } from 'pinia'
import type { Policyholder } from '@/types'
import * as api from '@/apis'

interface BlockNode {
  label: string
  code: string
  type: 'root' | 'direct' | 'indirect'
  expand?: boolean
  children?: BlockNode[]
}

export const SAMPLE_BLOCK_NODE: BlockNode = {
  label: '保戶1',
  code: '0000000001',
  type: 'root',
  expand: true,
  children: [
    {
      label: '保戶2',
      code: '0000000002',
      type: 'direct',
      expand: true,
      children: [
        {
          label: '保戶4',
          code: '0000000004',
          type: 'direct',
          expand: true,
          children: [
            {
              label: '保戶8',
              code: '0000000008',
              type: 'indirect',
            },
            {
              label: '保戶10',
              code: '0000000010',
              type: 'indirect',
            },
          ],
        },
        {
          label: '保戶5',
          code: '0000000005',
          type: 'direct',
          expand: true,
          children: [
            {
              label: '保戶9',
              code: '0000000009',
              type: 'indirect',
            },
            {
              label: '保戶11',
              code: '0000000011',
              type: 'indirect',
            },
          ],
        },
      ],
    },
    {
      label: '保戶3',
      code: '0000000003',
      type: 'direct',
      expand: true,
      children: [
        {
          label: '保戶6',
          code: '0000000006',
          type: 'indirect',
          expand: true,
          children: [
            {
              label: '保戶12',
              code: '0000000012',
              type: 'direct',
            },
            {
              label: '保戶14',
              code: '0000000014',
              type: 'indirect',
            },
          ],
        },
        {
          label: '保戶7',
          code: '0000000007',
          type: 'indirect',
          children: [
            {
              label: '保戶13',
              code: '0000000013',
              type: 'indirect',
            },
            {
              label: '保戶15',
              code: '0000000015',
              type: 'indirect',
            },
          ],
        },
      ],
    },
  ],
}

function transformNode(node: Policyholder, type = 'root') {
  const result = {
    label: node.name,
    code: node.code,
    expand: true,
    type,
  } as BlockNode;

  // 如果有子節點，遞迴處理
  const children = [];
  if (node.l) {
    children.push(transformNode(node.l, node.l.introducer_code === node.code ? 'direct' : 'indirect'));
  }
  if (node.r) {
    children.push(transformNode(node.r, node.r.introducer_code === node.code ? 'direct' : 'indirect'));
  }

  if (children.length > 0) {
    result.children = children;
  }

  return result;
}

export const usePolicyholderStore = defineStore('policyholder', {
  state: () => ({
    code: '',
    root: {} as BlockNode,
    loading: false,
  }),
  actions: {
    async load(code: string, top?: boolean) {
      try {
        this.loading = true
        const data = (top ? await api.getPolicyholdersTop(code) : await api.getPolicyholders(code))
        this.root = transformNode(data, 'root')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    query(code: string) {
      return this.load(code, false)
    },
    getTop(code: string) {
      return this.load(code, true)
    },
  },
})
