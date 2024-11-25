export interface Policyholder {
  code: string
  name: string
  registration_date: Date
  introducer_code: string
  l?: Policyholder
  r?: Policyholder
}
