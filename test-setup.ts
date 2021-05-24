import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

process.env.NEW_RELIC_ENABLED = 'false'
process.env.NEW_RELIC_NO_CONFIG_FILE = 'true'
