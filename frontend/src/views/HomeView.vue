<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import type { Policyholder } from '@/types'
import * as api from '@/apis'

interface BlockNode {
  label: string
  code: string
  type: 'root' | 'direct' | 'indirect'
  expand?: boolean
  children?: BlockNode[]
}

interface Form {
  code: string
  showDiagram: boolean
  rootPolicyholder: BlockNode
  data: Policyholder
  loading: boolean;
}

const form = ref<Form>({
  code: '',
  showDiagram: true,
  rootPolicyholder: {
    // label: '保戶1',
    // code: '0000000001',
    // type: 'root',
    // expand: true,
    // children: [
    //   {
    //     label: '保戶2',
    //     code: '0000000002',
    //     type: 'direct',
    //     expand: true,
    //     children: [
    //       {
    //         label: '保戶4',
    //         code: '0000000004',
    //         type: 'direct',
    //         expand: true,
    //         children: [
    //           {
    //             label: '保戶8',
    //             code: '0000000008',
    //             type: 'indirect',
    //           },
    //           {
    //             label: '保戶10',
    //             code: '0000000010',
    //             type: 'indirect',
    //           },
    //         ],
    //       },
    //       {
    //         label: '保戶5',
    //         code: '0000000005',
    //         type: 'direct',
    //         expand: true,
    //         children: [
    //           {
    //             label: '保戶9',
    //             code: '0000000009',
    //             type: 'indirect',
    //           },
    //           {
    //             label: '保戶11',
    //             code: '0000000011',
    //             type: 'indirect',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     label: '保戶3',
    //     code: '0000000003',
    //     type: 'direct',
    //     expand: true,
    //     children: [
    //       {
    //         label: '保戶6',
    //         code: '0000000006',
    //         type: 'indirect',
    //         expand: true,
    //         children: [
    //           {
    //             label: '保戶12',
    //             code: '0000000012',
    //             type: 'direct',
    //           },
    //           {
    //             label: '保戶14',
    //             code: '0000000014',
    //             type: 'indirect',
    //           },
    //         ],
    //       },
    //       {
    //         label: '保戶7',
    //         code: '0000000007',
    //         type: 'indirect',
    //         children: [
    //           {
    //             label: '保戶13',
    //             code: '0000000013',
    //             type: 'indirect',
    //           },
    //           {
    //             label: '保戶15',
    //             code: '0000000015',
    //             type: 'indirect',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
  } as BlockNode,
  data: {} as Policyholder,
  loading: false,
})

function transformNode(node, type = 'root') {
  if (!node) return null;

  const result = {
    label: node.name,
    code: node.code,
    expand: true,
    type,
  };

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

const loadPolicyholders = async (code: string, top?: boolean) => {
  try {
    form.value.loading = true
    const data = (top ? await api.getPolicyholdersTop(code) : await api.getPolicyholders(code))
    form.value.data = data
    form.value.rootPolicyholder = transformNode(data, 'root')
  } catch (error) {
    console.log(error)
    alert(error.response.data.message)
  } finally {
    await new Promise(resolve => setTimeout(resolve, 1000))
    form.value.loading = false
    form.value.showDiagram = false
    nextTick(() => {
      form.value.showDiagram = true
    })
  }
}

const queryPolicyholder = (code: string = form.value.code) => {
  loadPolicyholders(code, false)
}

const getTop = (code: string) => {
  loadPolicyholders(code, true)
}

onMounted(async () => {
  loadPolicyholders('0000000001', false)
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
      <button class="bg-blue-500 ml-2 px-2 rounded text-white" @click="queryPolicyholder()">查詢</button>
    </div>
    <h2 class="mt-2 flex items-center"><CaLoadBalancerListener class="inline mr-2" /> 關係圖</h2>
    <blocks-tree
      v-if="form.showDiagram"
      class="mt-2 self-center"
      :data="form.rootPolicyholder"
      :horizontal="false"
      :collapsable="true"
      :props="{ label: 'code', expand: 'expand', children: 'children', key: 'code' }"
    >
      <template #node="{ data, context }">
        <div class="node" :class="data.type">
          <span v-if="data.type === 'root'">{{ data.code }}</span>
          <span v-else class="link cursor-pointer underline" @click="queryPolicyholder(data.code)">{{ data.code }}</span>
          <br />
          <span>{{ data.label }}</span>
          <div class="parent link cursor-pointer" v-if="data.type === 'root'">
            <AkChevronUpSmall/>
            <span class="whitespace-nowrap" @click=getTop(data.code)>上一階</span>
          </div>
        </div>
      </template>
    </blocks-tree>
    <div v-if="form.loading" class="loading"><UiLoading/></div>
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

.loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  pointer-events: none;

  svg {
    width: 50px;
    font-size: 30px;
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
