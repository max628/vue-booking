<template lang="pug">
  div.page-wrap
    h1(class='page-title') Отель Лето
    div.page-content
      div.form-booking-wrap
        form.form-calculate(name='form-calculate', v-show='activeForm === "calculate"', @change='selectionChange($event)', ref='formCalculate')
          h2 Форма расчета стоимости
          div.form-row
            label(class='label-overall') Количество гостей
          div.form-row.col-3
            label(class='label-personal')
              span Взрослые и дети 12+
              span
                input(type='number', class='form-calculate__numadult', name='numAdult', min='1', step='1', autofocus, required, v-model.number='selection.numAdult')
            label(class='label-personal')
              span Дети 5-12 лет
              span
                input(type='number', class='form-calculate__numteenager', name='numTeenager', min='0', step='1', :max='maxTeen', v-model.number='selection.numTeenager')
            label(class='label-personal')
              span Дети до 5 лет
              span
                input(type='number', class='form-calculate__numchild', name='numChild', min='0', step='1', :max='maxChild', v-model.number='selection.numChild')
          div.form-row
            label(class='label-overall label-personal') Тип номера
              select(class='form-calculate__roomtype', name='roomType', v-model='selection.roomType',  required)
                option(v-for='(value, key) in roomTypes' :value="key") {{value}}
          div.form-row
            label(class='label-overall') Даты проживания
          div.form-row.col-2
            label(class='label-personal') От
              input(type='date', class='form-calculate__datefrom', name='dateFrom', required, :min='minDateFrom', :max='maxDateFrom', v-model='selection.dateFrom')
            label(class='label-personal') До
              input(type='date', class='form-calculate__dateto', name='dateTo', required, :min='minDateTo', :max='maxDateTo', v-model='selection.dateTo')
          div.form-row.result(v-html='calculationMsg')
          div.form-row.col-2
            button(class='btn next', @click.prevent='showNextForm($event)', :disabled='!isSelectionCorrect') Далее >>

        form.form-clientinfo(name='form-clientinfo', v-show='activeForm === "clientinfo"')
          h2 Контакты
          div.form-row
            input(type='text', class='form-clientinfo__fio', name='fio', required, placeholder='ФИО', v-model='clientInfo.fio')
          div.form-row
            input(type='email', class='form-clientinfo__email', name='email', required, placeholder='ваш@email.ru', v-model='clientInfo.email')
          div.form-row
            input(type='tel', class='form-clientinfo__tel', name='tel', required, placeholder='+7-xxx-xxx-xx-xx', v-model='clientInfo.tel')
          div.form-row.result
          div.form-row.col-2
            button(class='btn back', @click.prevent='showPrevForm($event)') << Назад
            button(class='btn send', disabled) Отправить
</template>
<script>

const MSINDAY = 86400000
const PLURALS = {
  day: ['день', 'дня', 'дней'],
  adult: ['взрослый', 'взрослых', 'взрослых'],
  child: ['ребенок', 'ребенка', 'детей'],
  man: ['человека', 'человек', 'человек']
}

export default {
  name: 'BookingForm',
  props: {
    seasonsPromise: {}
  },
  data () {
    return {
      activeForm: 'calculate',
      roomTypes: {
        econom: 'Эконом',
        standart: 'Стандарт',
        lux: 'Люкс'
      },
      selection: {
        roomType: 'econom',
        dateFrom: '',
        dateTo: '',
        numAdult: 1,
        numTeenager: 0,
        numChild: 0
      },
      clientInfo: {
        fio: '',
        email: '',
        tel: ''
      },
      seasons: {},
      thisSeason: {
        start: new Date(),
        end: new Date(),
        year: ''
      },
      isSelectionCorrect: false
    }
  },
  computed: {
    calculationMsg () {
      if (this.isSelectionCorrect) {
        let totalDays = (Date.parse(this.selection.dateTo) - Date.parse(this.selection.dateFrom)) / MSINDAY
        let arrDaysBySeason = ['low', 'high', 'low2'].map((season) => { return [season, this.getNumDaysOf(this.selection.dateFrom, this.selection.dateTo, season)] })
        let totalCost = arrDaysBySeason.reduce((accum, current) => {
          return accum + current[1] * (this.selection.numAdult * this.seasons[current[0]][this.selection.roomType] + this.selection.numTeenager * this.seasons[current[0]][this.selection.roomType] * (this.seasons[current[0]]['child_discount_perc'] / 100))
        }, 0)
        let msg = `
          <p>Стоимость отдыха с ${(new Date(this.selection.dateFrom)).toLocaleDateString()} по ${(new Date(this.selection.dateTo)).toLocaleDateString()} (${totalDays} ${this.getWord(totalDays, 'day')}) для ${this.selection.numAdult + this.selection.numTeenager + this.selection.numChild} ${this.getWord(this.selection.numAdult + this.selection.numTeenager + this.selection.numChild, 'man')}: ${totalCost} руб.</p>
          <p>Вы выбрали:
            <ul>
              <li>Категория номера: ${this.roomTypes[this.selection.roomType]}</li>
              <li>Для: ${this.selection.numAdult} ${this.getWord(this.selection.numAdult, 'adult')}${this.selection.numTeenager ? `, ${this.selection.numTeenager} ${this.getWord(this.selection.numTeenager, 'child')} 5-12 лет` : ''}${this.selection.numChild ? `, ${this.selection.numChild} ${this.getWord(this.selection.numChild, 'child')} 5-12 лет` : ''}</li>
            </ul>
          </p>
          `
        return msg
      } else {
        return 'Для расчета стоимости проживания заполните все поля корректно'
      }
    },
    maxTeen () {
      return (3 * this.selection.numAdult - this.selection.numChild) < 0 ? 0 : 3 * this.selection.numAdult - this.selection.numChild
    },
    maxChild () {
      return (3 * this.selection.numAdult - this.selection.numTeenager) < 0 ? 0 : 3 * this.selection.numAdult - this.selection.numTeenager
    },
    minDateFrom () {
      return (this.thisSeason.start > new Date()) ? this.thisSeason.start.toJSON().split('T')[0] : (new Date()).toJSON().split('T')[0]
    },
    maxDateFrom () {
      return (this.selection.dateTo && (new Date(Date.parse(this.selection.dateTo) - MSINDAY)).toJSON().split('T')[0]) || (new Date(this.thisSeason.end - MSINDAY)).toJSON().split('T')[0]
    },
    minDateTo () {
      return (this.selection.dateFrom && (new Date(Date.parse(this.selection.dateFrom) + MSINDAY)).toJSON().split('T')[0]) || (new Date(Date.parse(this.thisSeason.start) + MSINDAY)).toJSON().split('T')[0]
    },
    maxDateTo () {
      return this.thisSeason.end.toJSON().split('T')[0]
    }
  },
  created () {
    let self = this
    let today = new Date()
    this.seasonsPromise.then((data) => {
      self.seasons = data
      self.thisSeason.year = (new Date(today.getFullYear(), data.low2.date_to.split('.')[1] - 1, data.low2.date_to.split('.')[0]) > today) ? today.getFullYear() : today.getFullYear() + 1
      self.thisSeason.start = new Date(`${self.thisSeason.year}-${data.low.date_from.split('.')[1]}-${data.low.date_from.split('.')[0]}`)
      self.thisSeason.end = new Date(`${self.thisSeason.year}-${data.low2.date_to.split('.')[1]}-${data.low2.date_to.split('.')[0]}`)
    })
  },
  mounted () {
    this.isSelectionCorrect = this.$refs.formCalculate.checkValidity()
  },
  methods: {
    showNextForm (event) {
      this.activeForm = event.srcElement.form.nextElementSibling.name.split('-')[1]
    },
    showPrevForm (event) {
      this.activeForm = event.srcElement.form.previousElementSibling.name.split('-')[1]
    },
    selectionChange (event) {
      this.isSelectionCorrect = this.$refs.formCalculate.checkValidity()
    },
    getNumDaysOf (dateFrom, dateTo, season) {
      let seasonStart = new Date(`${this.thisSeason.year}-${this.seasons[season].date_from.split('.')[1]}-${this.seasons[season].date_from.split('.')[0]}`)
      let seasonEnd = new Date(`${this.thisSeason.year}-${this.seasons[season].date_to.split('.')[1]}-${+this.seasons[season].date_to.split('.')[0] + 1}`)
      if ((Date.parse(dateFrom) > seasonEnd) || (Date.parse(dateTo) < seasonStart)) {
        return 0
      } else if (Date.parse(dateFrom) >= seasonStart) {
        return (Date.parse(dateTo) < seasonEnd) ? (Date.parse(dateTo) - Date.parse(dateFrom)) / MSINDAY : (seasonEnd - Date.parse(dateFrom)) / MSINDAY
      } else if (Date.parse(dateFrom) < seasonStart) {
        return (Date.parse(dateTo) - seasonStart) / MSINDAY
      }
    },
    getWord (count, word) {
      let lastDigit = ('' + count).slice(-1)
      if (lastDigit >= 5 || (count > 9 && count < 15)) {
        return PLURALS[word][2]
      }
      return lastDigit === '1' ? PLURALS[word][0] : PLURALS[word][1]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
/* Defaults */
$app-font-size = 14px
$app-color = #888
$app-bg-color = #FFF

/* Functions */
setEm(pixels, context = $app-font-size) {
  context = unit(context, em)
  pixels/context
}

/* Reset */

*
  margin 0
  padding 0
  border 0
  outline 0
  background transparent
  font-size 100%

.clear
  &:after
    content ''
    display table
    clear both

/* General */

html
  height 100%
body
  height 100%
  font $app-font-size/1.5 Arial, serif
  color #888

/* Layout */

.page
  &-wrap
    position relative
    display flex
    flex-direction column
    align-items center
    width 100%
    height 100%

  &-title
    position relative
    margin-bottom 1em
    text-align center
  &-content
    padding 0 20px

/* Typography */

h1, h2, h3, h4, h5, h6
  margin-bottom 0.8em
  font-family Georgia, serif
h1
  font-size  setEm(27)
h2
  font-size  setEm(20)
h3
  font-size  setEm(20)
  font-style italic
h4
  font-size  setEm(18)
h5
  font-size  setEm(16)
  font-style italic
h6
  font-size  setEm(14)
  font-style italic

nav
  ol,
  ul
    list-style none

table
  margin-bottom 1em
  border-collapse collapse

  td
    padding 0.5em
    border 1px solid #444
a
  color #9b9586
  img
    vertical-align middle

p
  margin-bottom 0.8em
img
  max-width 100%
  height auto
strong,
dfn
  text-shadow -1px 1px 1px #000
  font-weight bold

input,
select
  padding .5em
  border 1px solid #AAA
  box-sizing border-box
  font-family Arial

  &:focus
    box-shadow 0px 0px 2px #888
  &:invalid
    border-color #F42828

label
  &.label-personal
    font-size .9em
    cursor pointer
  &.label-overall
    font-size 1em

    input,
    select,
    textarea
      margin-top 1em

button,
input[type='submit']
  padding .5em
  border-radius 4px
  background rgb(0, 132, 137)
  color #FFF
  cursor pointer

  &:disabled
    background #BBB
    cursor default

.warning
  color #FF5A5F

.form
  &-row
    margin-bottom 1em
    display flex
    justify-content space-between
    flex-wrap wrap

    > *:only-child
      flex-basis 100%
    &.col-2 > *
      flex-basis 48%
    &.col-3 > *
      flex-basis 30%

  &-booking-wrap
    max-width 500px
    min-width 300px

    form
      // display none
      width 100%

      &.current
        display block

  &-calculate,
  &-clientinfo
    input,
    select
      width 100%
      font-size .9rem

      &.invalid
        border-color #FF5A5F

  &-clientinfo
    max-width 300px

@media all and (max-width 640px)

  .page
    &-content
      width calc(100% - 40px)
  .form
    &-row
      flex-wrap wrap

      &.col-3 > *
        flex-basis 100%
        flex-shrink 0
        margin-bottom 10px

    &-booking-wrap
      min-width 200px

@media all and (max-width 320px)

  .form
    &-row
      &.col-2 > *
        flex-basis 100%
        flex-shrink 0
        margin-bottom 10px
</style>
