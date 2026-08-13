const NODES = [
  { id: 'us-west', x: 62, y: 96, r: 5.5, tone: 'brand' },
  { id: 'us-east', x: 150, y: 52, r: 4, tone: 'steel' },
  { id: 'eu-west', x: 236, y: 84, r: 7, tone: 'mint' },
  { id: 'eu-central', x: 300, y: 160, r: 4, tone: 'steel' },
  { id: 'apac', x: 214, y: 210, r: 5.5, tone: 'lime' },
  { id: 'branch', x: 106, y: 196, r: 4, tone: 'steel' },
  { id: 'core', x: 168, y: 132, r: 9, tone: 'brand' },
] as const

const LINKS: ReadonlyArray<[number, number]> = [
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [0, 5],
  [2, 3],
  [1, 2],
  [4, 5],
]

const TONE_FILL: Record<string, string> = {
  brand: 'fill-brand-500',
  mint: 'fill-mint-400',
  lime: 'fill-lime-300',
  steel: 'fill-steel-300',
}

export function NetworkTopology({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" opacity="0.35">
        {LINKS.map(([from, to]) => {
          const a = NODES[from]!
          const b = NODES[to]!
          return (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeDasharray="4 8"
              className="animate-dash"
              style={{ animationDelay: `${from * 0.35}s` }}
            />
          )
        })}
      </g>

      {NODES.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r * 2.4}
            className={TONE_FILL[node.tone]}
            opacity="0.12"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            className={TONE_FILL[node.tone]}
          />
        </g>
      ))}
    </svg>
  )
}
