import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()

export const getUser = () => user
