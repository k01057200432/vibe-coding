# Obsidian Terminal v2 — UI 리디자인

## 목표
Next.js UI를 Go HTMX 버전의 "Obsidian Terminal" 디자인 언어로 완전 리디자인.
Go 버전의 높은 정보 밀도, 글로우 이펙트, 트레이딩 터미널 감성을 계승하면서
마이크로 인터랙션과 모바일 최적화를 강화한 v2.

## 디자인 시스템

### 색상 (Go 버전 그대로)
```css
--bg-deep: #050a12
--bg-base: #0a1120
--bg-surface: #0f1729
--bg-elevated: #162035
--bg-hover: #1c2940

--border-subtle: #1a2540
--border-default: #243352
--border-emphasis: #2e4065

--text-primary: #e8edf5
--text-secondary: #8896b0
--text-muted: #4a5874
--text-dim: #2e3d56

--accent: #10b981 (emerald)
--accent-bright: #34d399
--accent-glow: rgba(16, 185, 129, 0.12)
--accent-red: #ef4444
--accent-red-glow: rgba(239, 68, 68, 0.12)
--accent-amber: #f59e0b
--accent-amber-glow: rgba(245, 158, 11, 0.12)
--accent-blue: #3b82f6
--accent-blue-glow: rgba(59, 130, 246, 0.12)
--accent-purple: #a78bfa
```

### 타이포그래피
- 본문: Plus Jakarta Sans (400/500/600/700/800)
- 데이터/숫자: JetBrains Mono (400/500/600/700)
- 폰트 사이즈: 0.5rem ~ 1.625rem (밀도 높게)

### 이펙트
- 도트 그리드 배경: `radial-gradient(circle at 1px 1px, rgba(30,45,75,0.35) 1px, transparent 0)` 28px 간격
- 카드: `var(--bg-surface)` + `1px solid var(--border-subtle)` + `border-radius: 12px`
- Stat 카드 하단 발광 바: `::after` 2px + box-shadow glow
- 사이드바 액티브: 왼쪽 2px 바 + drop-shadow
- 호버: 미세한 translateY(-1px) + border glow

### v2 추가 요소
- 카드 hover: `transform: translateY(-1px)` + `border-color` 변화
- 실시간 펄스 도트: `.live-dot` 애니메이션
- 위험 상태 시 보더 색상 자동 변화
- 키보드 단축키 배지: Ctrl/Alt 누르면 애니메이션 등장

## 텍스트/라벨 (Go 버전 통일)
- 앱 이름: "Trading Terminal" (트레이딩 플랫폼 → Trading Terminal)
- 부제: "Operator v1.0"
- 하단: "System Online" + 라이브 도트
- 사이드바 섹션: "AI 어드바이저" / "운영" / "시스템"
- 네비 라벨: 소개, Claude Chat, 대시보드, 알림, 전략, 브로커, 시뮬레이션, 거래 내역, Intel, 서비스 상태, 설정
- 대시보드 Hero Bar: PNL TODAY, WIN RATE, VIX, STRATEGIES (uppercase mono)
- 페이지 제목 + 부제 패턴: "전략 관리" + "전략 생성, 수정, 활성화 관리"

## 작업 분배

### Task 1: 디자인 시스템 (designer)
- `globals.css` 완전 재작성
- CSS 변수 시스템 (5단계 배경, 보더, 텍스트, 액센트+글로우)
- 도트 그리드 배경
- 유틸리티 클래스 (.text-profit, .text-loss, .text-warning, .stat-value, .stat-label 등)
- 폰트 임포트 (Plus Jakarta Sans + JetBrains Mono)
- 카드, 배지, 버튼 스타일 오버라이드
- 히트맵 셀 클래스 (.hm-gain-1~4, .hm-loss-1~4)
- 모바일 반응형 (768px, 480px)
- iOS 자동 줌 방지

### Task 2: 레이아웃 + 네비게이션 (layout)
- `app-shell.tsx` — 도트 그리드 배경 적용
- `sidebar.tsx` — 섹션 구분, 브랜드 (Trading Terminal + Operator v1.0), 하단 System Online + 라이브 도트, 단축키 배지
- `mobile-nav.tsx` — 모바일 상단바 스타일
- `layout.tsx` — 폰트 로드 (Plus Jakarta Sans, JetBrains Mono)

### Task 3: 대시보드 (dashboard)
- `page.tsx` — Kill All/Resume/Restart 액션 버튼 추가, Hero Bar 구조
- `stats-cards.tsx` → Hero Bar 스타일 (가로 바, uppercase mono 라벨)
- `pnl-heatmap.tsx` — Go 버전 히트맵 스타일 (12px 셀, 요일/월 라벨, 범례)
- `pnl-chart.tsx` — 기간 선택 버튼 (7D/30D/90D)
- `timeline.tsx` — Go 버전 통합 타임라인 (거래 + 알림)
- `strategy-matrix.tsx` — 히트맵 매트릭스 테이블

### Task 4: 나머지 페이지 (pages)
- `strategies/` — 페이지 제목+부제, 브로커 서머리 카드, 테이블 Go 스타일
- `brokers/` — Go 스타일 카드
- `trades/` — data-table 스타일
- `notifications/` — 필터 + 리스트
- `intel/` — 이벤트 행, VIX 스파크라인
- `status/` — 서비스 그리드
- `settings/` — 폼 스타일
- `simulation/` — 리스트 + 대시보드
- `reports/` — 마크다운 렌더러
