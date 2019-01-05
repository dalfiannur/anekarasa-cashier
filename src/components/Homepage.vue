<template lang="pug">
  v-app( id="app" )
    v-toolbar( app class="primary" )
      v-btn( color="green" @click.native="$router.push('/add-reservation')" )
        |Tambah Pesanan
    v-content( app )
      v-container( fluid )
        v-layout( row wrap )
          v-flex( md4 )
            v-data-table( :headers="orderTable.headers" :items="orderTable.items" )
              template( slot="items" slot-scope="props" )
                td
                  |{{ props.item.number }}
                td( class="text-xs-right" )
                  |{{ props.item.table_id }}
                td( class="text-xs-right" )
                  v-btn( icon @click="onDetail(props.item.number)" )
                    v-icon
                      |edit
              template( slot="pageText" slot-scope="{ pageStart, pageStop }" )
                |Dari {{ pageStart }} sampai {{ pageStop }}
          v-flex( md7 offset-md1 )
            v-layout( row wrap )
              v-flex( md3 )
                label
                  |Total Tagihan
                v-text-field( solo prefix="Rp" v-model="totalTagihan" readonly )
              v-flex( md2 offset-md1 )
                label
                  |Diskon
                v-text-field( solo suffix="%" v-model="diskon" @keyup.enter="countTotalTagihan();countCashBack()" )
              v-flex( md3 offset-md1 )
                label
                  |Kembalian
                v-text-field( solo prefix="Rp" readonly v-model="cashback" )
            v-layout( row wrap )
              flex( md6 )
                label
                  |Pembayaran
                v-text-field( solo prefix="Rp" v-model="cash" @keyup="countCashBack" )
              v-flex( md5 offset-md1 style="padding-top: 22px" )
                v-btn( @click="onPrint" )
                  |LUNAS
                v-btn( @click="onSave" )
                  |SIMPAN
            v-data-table( :headers="detailTable.headers" :items="detailTable.items" )
                template( slot="items" slot-scope="props" )
                  td
                    |{{ props.item.product_name }}
                  td
                    |{{ props.item.price }}
                  td
                    v-edit-dialog( :return-value.sync="props.item.quantity" lazy persistent )
                      |{{ props.item.quantity }}
                      v-text-field( slot="input" label="Banyak" v-model="props.item.quantity" single-line counter autofocus )
                  td( class="text-md-center" )
                    v-btn( icon )
                      v-icon
                        |delete
                template( slot="pageText" slot-scope="{ pageStart, pageStop }" )
                  |Dari {{ pageStart }} sampai {{ pageStop }}
</template>

<script>
import axios from 'axios'
const url = process.env.API
export default {
  data () {
    return {
      diskon: 0,
      cash: 0,
      cashback: 0,
      totalTagihan: 0,
      orderTable: {
        headers: [
          {
            text: 'No Pesanan',
            align: 'center',
            sortable: true,
            value: 'number'
          },
          {
            text: 'No Meja',
            align: 'center',
            sortable: true,
            value: 'table_id'
          },
          {
            text: '',
            value: ''
          }
        ],
        items: []
      },
      detailTable: {
        headers: [
          {
            text: 'Nama Pesanan',
            align: 'center',
            sortable: true,
            value: 'product_name'
          },
          {
            text: 'Harga',
            align: 'center',
            sortable: true,
            value: 'price'
          },
          {
            text: 'Banyak Pesanan',
            align: 'center',
            sortable: true,
            value: 'quantity'
          },
          {
            text: '',
            value: ''
          }
        ],
        items: []
      }
    }
  },

  mounted () {
    this.loadOrders()
  },

  methods: {
    loadOrders () {
      axios.get(url + '/cashier/report').then(response => {
        this.orderTable.items = response.data
      })
    },

    async onDetail (number) {
      await axios.get(`${url}/cashier/report/${number}/detail`).then(response => {
        this.detailTable.items = response.data
        this.diskon = response.data[0].disc
      })
      this.countTotalTagihan()
    },

    countTotalTagihan () {
      let total = 0
      this.detailTable.items.forEach(item => {
        total += item.quantity * item.price
      })
      this.totalTagihan = total - ((this.diskon / 100) * total)
    },

    countCashBack () {
      this.cashback = this.cash - this.totalTagihan
    },

    onSave () {
      axios.put(`${url}/cashier/report/:id/update`, this.detailTable.items)
    },

    onPrint () {
      this.onSave()
    }
  }
}
</script>
