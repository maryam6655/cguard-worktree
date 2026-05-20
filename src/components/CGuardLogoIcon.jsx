export default function CGuardLogoIcon({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="48" cy="48" r="44" stroke="#64748B" strokeWidth="1.5" fill="none" opacity="0.3" />
      <circle cx="48" cy="48" r="38" stroke="#64748B" strokeWidth="1.5" fill="none" opacity="0.4" />

      <circle cx="48" cy="48" r="32" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="48" cy="48" r="26" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.8" />

      <circle cx="48" cy="48" r="20" stroke="#1e3a5f" strokeWidth="2.5" fill="none" />

      <path
        d="M 48 18 C 48 18 60 32 60 42 C 60 52 54.5 58 48 58 C 41.5 58 36 52 36 42 C 36 32 48 18 48 18 Z"
        fill="#1e3a5f"
        opacity="0.95"
      />

      <ellipse cx="48" cy="40" rx="8" ry="10" fill="#22D3EE" opacity="0.25" />

      <path
        d="M 48 28 C 53 28 56 31.5 56 36 C 56 40.5 53 44 48 44"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="48" cy="4" r="3" fill="#22D3EE">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="79.5" cy="63" r="3" fill="#22D3EE">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="16.5" cy="63" r="3" fill="#22D3EE">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin="0.66s" />
      </circle>


    </svg>
  );
}