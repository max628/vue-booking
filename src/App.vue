<template>
  <div id="app">
    <booking-form :seasonsPromise='seasonsPromise'/>
  </div>
</template>

<script>
import BookingForm from '@/components/BookingForm'

export default {
  name: 'App',
  components: {BookingForm},
  data () {
    return {
      seasonsPromise: {}
    }
  },
  created () {
    this.seasonsPromise = fetch('/static/seasons.json').then((response) => {
      return response.json()
    }).then((seasons) => {
      return seasons
    }).catch((e) => {
      console.log('Fetch error: ', e)
    })
  }
}
</script>

<style lang="stylus">

</style>
