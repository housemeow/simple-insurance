<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { usePolicyholderStore } from '@/stores/policyholder'

const state = ref({
  showDiagram: true,
  loading: false,
})

const policyholderStore = usePolicyholderStore()

const handleViewState = async (func: () => void) => {
  try {
    await func()
  } catch (error) {
    console.log(error)
    alert(error.response.data.message)
  } finally {
    state.value.showDiagram = false
    nextTick(() => {
      state.value.showDiagram = true
    })
  }
}

const load = (code: string, top?: boolean) => handleViewState(() => policyholderStore.load(code, top))
const query = (code: string = policyholderStore.code) => handleViewState(() => policyholderStore.query(code))
const getTop = (code: string) => handleViewState(() => policyholderStore.getTop(code))

onMounted(() => load('0000000001', false))
</script>

<template>
  <main class="p-4 flex flex-col">
    <h1 class="flex items-center"><FlPeopleCommunity class="inline mr-2" /> 保戶關係查詢</h1>
    <div class="mt-2 border-[1px] border-solid border-black px-4 py-2">
      <label for="code">
        保戶編號
        <input id="code" v-model="policyholderStore.code" class="px-2 border-[1px] rounded border-black" @keydown.enter="query()" />
      </label>
      <button class="bg-blue-500 ml-2 px-2 rounded text-white" @click="query()">查詢</button>
    </div>
    <h2 class="mt-2 flex items-center"><CaLoadBalancerListener class="inline mr-2" /> 關係圖</h2>
    <blocks-tree
      v-if="state.showDiagram"
      class="mt-2 self-center"
      :data="policyholderStore.root"
      :horizontal="false"
      :collapsable="true"
      :props="{ label: 'code', expand: 'expand', children: 'children', key: 'code' }"
    >
      <template #node="{ data, context }">
        <div class="node" :class="data.type">
          <span v-if="data.type === 'root'">{{ data.code }}</span>
          <span v-else class="link cursor-pointer underline" @click="query(data.code)">{{ data.code }}</span>
          <br />
          <span>{{ data.label }}</span>
          <div class="parent link cursor-pointer" v-if="data.type === 'root'">
            <AkChevronUpSmall/>
            <span class="whitespace-nowrap" @click=getTop(data.code)>上一階</span>
          </div>
        </div>
      </template>
    </blocks-tree>
    <div v-if="policyholderStore.loading" class="loading"><UiLoading/></div>
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
