import DHT from 'bittorrent-dht'
import ed25519 from '@trashman/ed25519-blake2b'
import crypto from 'crypto'

const private_key = crypto.randomBytes(32)
const public_key = ed25519.publicKey(private_key)

const message = 'i like turtles'
const message_buffer = Buffer.from(message)
const message_hash = ed25519.hash(message_buffer)
const signature = ed25519.sign(message_hash, private_key, public_key)
const block_hash = Buffer.from('991CF190094C00F0B68E2E5F75F6BEE95A2E0BD93CEAA4A6734DB9F19B728948', 'hex')

const dht = new DHT({
  hash: ed25519.hash,
  verify: () => true
})

const put_signed_message = () => {
  dht.put({
    k: block_hash,
    seq: -1,
    sig: signature,
    v: {
      msg: message,
      sig: signature,
      pub: public_key
    }
  })
  console.log(`put signed message for block hash: ${block_hash.toString('hex')}`)
}

dht.listen(20000, function () {
  console.log('now listening')
})

dht.on('ready', function () {
  console.log('ready')

  setInterval(put_signed_message, 10000)
  setInterval(() => dht.addNode({ host: '127.0.0.1', port: 20001 }), 1000)
})