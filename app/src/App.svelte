<script lang="ts">
  import { onMount } from 'svelte'
  import { Hamburger } from 'svelte-hamburgers'
  import {
    Banner,
    Select,
    Spinner,
    Input,
    Checkbox,
    CloseButton,
    Modal,
    Textarea,
    Button,
  } from 'flowbite-svelte'
  import type { AspectData, OwnedAspect, OwnedAspects } from './lib/types'
  import Aspect from './lib/Aspect.svelte'

  import { showSlotBasedViewStore, slotFilterStore } from './store.js'

  let classes = [
    { value: '', name: 'All Classes' },
    { value: 'Barbarian', name: 'Barbarian' },
    { value: 'Druid', name: 'Druid' },
    { value: 'Necromancer', name: 'Necromancer' },
    { value: 'Rogue', name: 'Rogue' },
    { value: 'Sorcerer', name: 'Sorcerer' },
  ]

  let codex = [
    { value: '', name: 'All Aspects' },
    { value: 'true', name: 'In Codex' },
    { value: 'false', name: 'Not In Codex' },
  ]

  // "Defensive": "Amulet [+50%], Chest, Helmet, Pants, Shield.",
  // 	"Offensive": "Amulet [+50%], Gloves, Ring, 1H Weapon, 2H Weapon [+100%].",
  // 	"Utility": "Amulet [+50%], Boots, Chest, Gloves, Helmet, Shield.",
  // 	"Resource": "Ring.",
  // 	"Mobility": "Amulet [+50%], Boots.",
  //  "Weapon": "1H Weapon, 2H Weapon [+100%].",

  let slots = [
    { value: '', name: 'All Slots' },
    { value: 'Helmet', name: 'Helmet' },
    { value: 'Chest', name: 'Chest' },
    { value: 'Gloves', name: 'Gloves' },
    { value: 'Pants', name: 'Pants' },
    { value: 'Boots', name: 'Boots' },
    { value: 'Weapon', name: 'Weapon' },
    { value: 'Offhand', name: 'Offhand' },
    { value: 'Amulet', name: 'Amulet' },
    { value: 'Ring', name: 'Ring' },
    { value: 'Shield', name: 'Shield' },
  ]

  let realSlots = [
    { value: 'Helmet', name: 'Helmet' },
    { value: 'Chest', name: 'Chest' },
    { value: 'Gloves', name: 'Gloves' },
    { value: 'Pants', name: 'Pants' },
    { value: 'Boots', name: 'Boots' },
    { value: 'Weapon', name: 'Weapon' },
    { value: 'Offhand', name: 'Offhand' },
    { value: 'Amulet', name: 'Amulet' },
    { value: 'Ring', name: 'Ring' },
    { value: 'Shield', name: 'Shield' },
  ]

  //new section for slot based sorting
  //let showSlotBasedView = $showSlotBasedViewStore

  let aspects = []
  let selectedClass = ''
  let searchTerm = ''
  let selectedSlot = ''
  let limitToOwned = false
  let selectedCodex = ''
  let ownedAspectsString = ''
  let importAspectsString = ''
  let filteredSlot = ''
  let importModal = false
  let exportModal = false
  import { OwnedAspectsClass } from './lib/OwnedAspectsClass'

  let ownedAspects = new OwnedAspectsClass(loadOwnedAspectsFromLocalStorage())

  let open

  let browserLanguage = navigator.language.replace('-', '')

  let selectedLocalization = localStorage.getItem('_localization')

  let supportedLocalizations = [
    { value: 'enUS', name: 'USA' },
    { value: 'deDE', name: 'Germany' },
    { value: 'esES', name: 'Spain' },
    { value: 'esMX', name: 'Mexico' },
    { value: 'frFR', name: 'France' },
    { value: 'itIT', name: 'Italy' },
    { value: 'jaJP', name: 'Japan' },
    { value: 'koKR', name: 'Korea' },
    { value: 'plPL', name: 'Poland' },
    { value: 'ptBR', name: 'Brazil' },
    { value: 'trTR', name: 'Turkey' },
    { value: 'zhTW', name: 'Taiwan' },
  ]
  if (selectedLocalization == null || selectedLocalization == '') {
    if (supportedLocalizations.find((x) => x.value === browserLanguage)) {
      selectedLocalization = browserLanguage
    } else {
      selectedLocalization = 'enUS'
    }
    localStorage.setItem('_localization', selectedLocalization)
  }
  let currentSlotFilter = ' '

  //let ownedAs = []
  let filteredOwned = new OwnedAspectsClass(ownedAspects.getAllOwnedAspects())
  $: console.log('slotbased' + $showSlotBasedViewStore)
  $: slotFilterStore.set(currentSlotFilter)

  async function getAspects() {
    const aspects_db_url = '/aspects.json'

    try {
      const response = await fetch(aspects_db_url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data: AspectData = await response.json()

      // Check if the response is valid JSON
      if (typeof data !== 'object') {
        throw new Error('Invalid JSON format!')
      }

      aspects = Object.entries(data).map(([name, aspect]) => ({
        name: name,
        ...aspect,
      }))
    } catch (error) {
      console.error(error)
    }
  }

  function setLocalization() {
    localStorage.setItem('_localization', selectedLocalization)
  }

  function loadOwnedAspectsFromLocalStorage(): OwnedAspects {
    const loadedOwnedAspects: OwnedAspects = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        if (key.indexOf('_') === 0) {
          continue
        }
        const values = localStorage.getItem(key)
        console.log('loadfromstorage key ' + key)
        if (values) {
          try {
            loadedOwnedAspects[key] = JSON.parse(values)
          } catch (error) {
            console.error(`Error parsing data for key "${key}":`, error)
          }
        }
      }
    }

    return loadedOwnedAspects
  }

  // Load owned aspects from local storage on component mount
  onMount(() => {
    getAspects()
    // example ownedAspects
    // {
    //   "Abyssal": [{
    //     "note": "25%",
    //     "time": "2021-05-01T12:00:00"
    //   }, {
    //     "note": "50%",
    //     "time": "2021-05-02T12:00:00"
    //   }]
    // }

    localStorage.removeItem('localization')

    // Load owned aspects from local storage
    ownedAspects.updateOwnedAspects(loadOwnedAspectsFromLocalStorage())
  })
  // Function to handle the event when a new aspect is added
  function handleAspectUpdated() {
    // Update the local data or trigger a refresh
    ownedAspects.updateOwnedAspects(loadOwnedAspectsFromLocalStorage())
  }

  $: if (exportModal) {
    ownedAspectsString = JSON.stringify(loadOwnedAspectsFromLocalStorage())
  }

  $: if (exportModal) {
    ownedAspectsString = JSON.stringify(loadOwnedAspectsFromLocalStorage())
  }

  function getAspectsForSlot(currentSlotFilter) {
    //console.log('Current slot filter:'+currentSlotFilter)
    //console.log(ownedAs)
    //filteredOwned is the resulting array of owned aspects for the current slot
    filteredOwned.updateOwnedAspects(
      ownedAspects
        .getAllOwnedAspectsArray()
        .filter(([key, aspects]) =>
          aspects.some((aspect) => aspect.note.includes(currentSlotFilter))
        )
        .reduce((obj, [key, aspects]) => {
          obj[key] = aspects
          return obj
        }, {})
    )
    console.log(filteredOwned.getAllOwnedAspectsArray())
    return filteredOwned.valid() && false
  }

  // Filter and sort aspects based on selected class and search term
  $: filteredAspects = aspects
    .filter((aspect) => {
      console.log('start of fitler' + aspect + ' ' + selectedClass)
      if (selectedClass === '') {
        return true
      } else if (selectedClass === 'All Classes') {
        return true
      } else {
        return aspect.class === selectedClass || aspect.class === 'Generic'
      }
    })
    .filter((aspect) => {
      console.log(
        'midfilter ' +
          aspect +
          ' ' +
          searchTerm +
          ' ' +
          selectedLocalization +
          ' ' +
          selectedCodex +
          ' ' +
          limitToOwned +
          ' ' +
          selectedSlot
      )
      if (searchTerm === '') {
        return true
      }
      let hyphenateLocalization = ''
      if (selectedLocalization.length === 4) {
        const languageCode = selectedLocalization.substring(0, 2)
        const countryCode = selectedLocalization.substring(2)
        hyphenateLocalization = languageCode + '-' + countryCode
      } else hyphenateLocalization = 'en-US'

      const lowercaseInput = searchTerm
        .normalize('NFC')
        .toLocaleLowerCase(hyphenateLocalization)
      const lowercaseName = aspect.name_localized[selectedLocalization]
        .normalize('NFC')
        .toLocaleLowerCase(hyphenateLocalization)
      const lowercaseDesc = aspect.desc_localized[selectedLocalization]
        .normalize('NFC')
        .toLocaleLowerCase(hyphenateLocalization)
      return (
        //check if search term is value that can be lowercased
        lowercaseName.includes(lowercaseInput) ||
        lowercaseDesc.includes(lowercaseInput)
      )
    })
    .filter((aspect) => {
      console.log(
        'codex' +
          aspect.in_codex +
          ' ' +
          selectedCodex +
          ' ' +
          limitToOwned +
          ' ' +
          selectedSlot +
          ' ' +
          aspect
      )
      if (selectedCodex === '') {
        return true
      } else if (selectedCodex === 'false') {
        return !aspect.in_codex
      } else if (selectedCodex === 'true') {
        return aspect.in_codex
      }
    })
    .filter((aspect) => {
      if (limitToOwned) {
        return ownedAspects.getAspectsByName(aspect.name) !== undefined
      }
      return true
    })
    .filter((aspect) => {
      console.log(
        'slot filter:' + aspect + ' ' + selectedSlot + ' ' + aspect.category
      )
      if (selectedSlot === '') {
        return true
      } else if (selectedSlot === 'Helmet') {
        return aspect.category === 'Defensive' || aspect.category === 'Utility'
      } else if (selectedSlot === 'Chest') {
        return aspect.category === 'Defensive' || aspect.category === 'Utility'
      } else if (selectedSlot === 'Gloves') {
        return aspect.category === 'Offensive' || aspect.category === 'Utility'
      } else if (selectedSlot === 'Pants') {
        return aspect.category === 'Defensive'
      } else if (selectedSlot === 'Boots') {
        return aspect.category === 'Utility' || aspect.category === 'Mobility'
      } else if (selectedSlot === 'Weapon' || aspect.category === 'Offhand') {
        return aspect.category === 'Offensive' || aspect.cateogry === 'Weapon'
      } else if (selectedSlot === 'Amulet') {
        return (
          aspect.category === 'Defensive' ||
          aspect.category === 'Offensive' ||
          aspect.category === 'Utility' ||
          aspect.category === 'Mobility'
        )
      } else if (selectedSlot === 'Ring') {
        return aspect.category === 'Offensive' || aspect.category === 'Resource'
      } else if (selectedSlot === 'Shield') {
        return aspect.category === 'Defensive' || aspect.category === 'Utility'
      } else {
        return false
      }
    })
    .sort((a, b) => {
      const regex = /^of the |^of /i
      const nameA = a.name.replace(regex, '').toLowerCase()
      const nameB = b.name.replace(regex, '').toLowerCase()
      if (nameA < nameB) {
        return -1 // a should come before b in the sorted order
      }
      if (nameA > nameB) {
        return 1 // a should come after b in the sorted order
      }
      return 0 // a and b are equal in terms of sorting
    })

  function clearSearch(e: MouseEvent): void {
    searchTerm = ''
  }

  function importData(e: MouseEvent): void {
    let importAspects: OwnedAspects = {}
    importAspects = JSON.parse(importAspectsString)

    // Save owned aspects to local storage
    for (const key in importAspects) {
      const values = importAspects[key]
      localStorage.setItem(key, JSON.stringify(values))
    }

    importAspectsString = ''
    importModal = false

    ownedAspects.updateOwnedAspects(loadOwnedAspectsFromLocalStorage())
  }

  function copyText(e: MouseEvent): void {
    navigator.clipboard
      .writeText(ownedAspectsString)
      .then(() => {
        alert('Copied Aspects to Clipboard')
      })
      .catch(() => {
        alert('something went wrong')
      })
  }
</script>

<Banner id="top-banner" position="relative">
  <p
    class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"
  >
    <span
      class="inline-flex p-1 mr-3 bg-gray-200 rounded-full dark:bg-gray-600"
    >
      <svg
        class="w-4 h-4 text-gray-500 dark:text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
        />
      </svg>
      <span class="sr-only">Issues and Comments</span>
    </span>
    <span
      ><p>
        This project is open source. Please report issues, feedback, and
        comments on our <a
          href="https://github.com/fawadasaurus/d4-aspect-tracker/issues"
          class="inline font-medium text-primary-600 underline dark:text-primary-500 underline-offset-2 decoration-600 dark:decoration-500 decoration-solid hover:no-underline"
          >Github</a
        >
      </p>
      <!-- <p>
        Localization (language) and Export/Import in the menu on the top left.
      </p> -->
    </span>
    <span />
  </p>
</Banner>

<Modal title="Import Aspects" bind:open={importModal} autoclose>
  <Textarea bind:value={importAspectsString} />
  <Button on:click={importData}>Import</Button>
</Modal>

<Modal title="Export Aspects" bind:open={exportModal} autoclose>
  <Textarea bind:value={ownedAspectsString} readonly />
  <Button on:click={copyText}>Copy</Button>
</Modal>

<Hamburger --color="grey" bind:open />
{#if open}
  <Button on:click={() => (exportModal = true)}>Export</Button>
  <Button on:click={() => (importModal = true)}>Import</Button>
  <Select
    placeholder="Language"
    class="w-40 inline-block"
    items={supportedLocalizations}
    bind:value={selectedLocalization}
    on:change={setLocalization}
  />
{/if}

<div class="p-4">
  <div class="mb-8 md:max-w-md mx-auto">
    <h1 class="text-2xl text-red-600 font-medium mb-4">D4 Aspect Tracker</h1>
    <Input
      bind:value={searchTerm}
      placeholder="Search by name or description"
      class="mt-2"
    >
      <CloseButton slot="right" on:click={clearSearch} />
    </Input>
    <Select
      placeholder="Select a class"
      class="mt-2"
      items={classes}
      bind:value={selectedClass}
    />
    <Select
      placeholder="Select item slot"
      class="mt-2"
      items={slots}
      bind:value={selectedSlot}
    />
    <Select
      placeholder="Both In Codex and Not in Codex"
      class="mt-2"
      items={codex}
      bind:value={selectedCodex}
    />
    <div class="mt-2">
      <Checkbox class="text-base" name="lto" bind:checked={limitToOwned}>
        Limit to owned
      </Checkbox>
    </div>

    {#if limitToOwned}
      <div class="flex items-center mb-4">
        <input
          id="sbv"
          type="checkbox"
          value=""
          bind:checked={$showSlotBasedViewStore}
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          for="sbv"
          class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Show Slot Based View</label
        >
      </div>

      <!--<div>
        <Checkbox class="text-base" name="sbv" bind:checked={$showSlotBasedViewStore}>
          Show Slot Based View
        </Checkbox>
      </div>-->
      <!--<Checkbox bind:checked={showSlotBasedView}>Show Slot Based View</Checkbox>-->
    {/if}
  </div>
  {console.log('another slot based boolean check:' + $showSlotBasedViewStore)}
  {#if $showSlotBasedViewStore}
    {#each realSlots as slot}
      <div class="mb-8 flex flex-col">
        {#if getAspectsForSlot(slot.value)}
          <!--{#if filteredOwned.valid()&&}-->
          {#each filteredOwned.getAllOwnedAspectsArray() as aspect}
            {console.log('aspect check during slot based cycle:' + aspect)}
            <Aspect
              {aspect}
              {selectedLocalization}
              on:aspectUpdated={handleAspectUpdated}
            />
          {/each}
        {/if}
      </div>
    {/each}
  {:else}
    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {console.log(
        'filtered aspects: ' +
          filteredAspects +
          'length: ' +
          filteredAspects.length
      )}
      {#if filteredAspects.length > 0}
        {#each filteredAspects as aspect}
          <Aspect
            {aspect}
            {selectedLocalization}
            on:aspectUpdated={handleAspectUpdated}
          />
        {/each}
      {:else}
        <Spinner />
      {/if}
    </div>
  {/if}
  {console.log('end of app file')}
</div>
