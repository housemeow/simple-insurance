<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Policyholder {
  code: string
  name: string
  registration_date: Date
  introducer_code: string
  l?: Policyholder
  r?: Policyholder
}

interface BlockNode {
  label: string
  expand: boolean
  id: string
  children?: BlockNode[]
}

interface Form {
  code: string
  rootPlaceholder: Policyholder
}

const form = ref({
  code: '',
  rootPlaceholder: {} as Policyholder,
})

const treeOrientation = ref('0')
const treeData = reactive({
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
})
</script>

<template>
  <main class="p-4 flex flex-col">
    <h1 class="flex items-center"><FlPeopleCommunity class="inline mr-2" /> 保戶關係查詢</h1>
    <div class="mt-2 border-[1px] border-solid border-black px-4 py-2">
      <label for="code">
        保戶編號
        <input id="code" v-model="form.code" class="px-2 border-[1px] rounded border-black" />
      </label>
      <button class="bg-blue-500 ml-2 px-2 rounded text-white">查詢</button>
    </div>
    <h2 class="mt-2 flex items-center"><CaLoadBalancerListener class="inline mr-2" /> 關係圖</h2>
    <blocks-tree
      class="mt-2 self-center"
      :data="treeData"
      :horizontal="treeOrientation == '1'"
      :collapsable="true"
      :props="{ label: 'code', expand: 'expand', children: 'children', key: 'code' }"
    >
      <template #node="{ data, context }">
        <div class="node" :class="data.type">
          <span v-if="data.type === 'root'">{{ data.code }}</span>
          <span v-else class="link cursor-pointer underline">{{ data.code }}</span>
          <br />
          <span>{{ data.label }}</span>
          <div class="parent link cursor-pointer" v-if="data.type === 'root'">
            <AkChevronUpSmall/>
            <span class="whitespace-nowrap">上一階</span>
          </div>
        </div>
      </template>
    </blocks-tree>
  </main>
</template>

<style lang="scss" scoped>
:deep(.org-tree-node-label-inner) {
  padding: 0;

  .node {
    padding: 10px 15px;
    position: relative;

    .link {
      color: #045494;
    }

    &.root {
      background: #ffe598;
    }

    &.direct {
      background: #b9d7aa;
    }

    &.indirect {
      background: #efefef;
    }

    .parent {
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translate(0, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
