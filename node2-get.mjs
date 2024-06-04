import DHT from 'bittorrent-dht'
import ed25519 from '@trashman/ed25519-blake2b'

const dht = new DHT({
  hash: ed25519.hash,
  verify: () => true
})

const block_hash = Buffer.from('991CF190094C00F0B68E2E5F75F6BEE95A2E0BD93CEAA4A6734DB9F19B728948', 'hex')
const key = ed25519.hash(block_hash)

const get_signed_message = () => {
  console.log(`getting signed message for block hash: ${block_hash.toString('hex')}`)
  dht.get(key, (err, res) => {
    if (err) {
      console.error('Failed to get message:', err)
      return
    }

    if (!res) {
      console.error('No response')
      return
    }

    const msg = res.v.msg.toString('utf8')
    const message_hash = ed25519.hash(res.v.msg)
    const sig = res.v.sig.toString('hex')
    console.log({
      msg,
      sig,
      verified: ed25519.verify(sig, message_hash, res.v.pub)
    })
  })
}

dht.listen(20001, function () {
  console.log('now listening')
  setInterval(get_signed_message, 5000)
})

dht.on('ready', function () {
  console.log('ready')

  setInterval(() => dht.addNode({ host: '127.0.0.1', port: 20000 }), 1000)
})