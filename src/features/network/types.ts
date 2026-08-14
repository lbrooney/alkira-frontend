export type ConnectorKind =
  | 'AWS-VPC'
  | 'AZURE-VNET'
  | 'GCP-VPC'
  | 'BRANCH'
  | 'REMOTE-ACCESS'

export type ConnectorState = 'ACTIVE' | 'DEGRADED' | 'DOWN'

export interface Connector {
  id: string
  name: string
  kind: ConnectorKind
  cxp: string
  region: string
  segment: string
  state: ConnectorState
  enabled: boolean
  throughputMbps: number
  updatedAt: string
}

export interface ConnectorPatch {
  name?: string
  segment?: string
  enabled?: boolean
}
