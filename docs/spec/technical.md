# 출퇴근 대중교통 길잡이 — 기술·데이터 설계

> 문서 버전 v14 · 완성도 100% · 마지막 수정 2026. 10. 28. 18시 31분 35초
> 이 문서만 보고 AI(또는 개발자)가 개발해도 거의 같은 결과가 나오도록 작성되었습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 사이트 이름 | 출퇴근 대중교통 길잡이 |
| 영문 식별자(slug) | commute-transit-guide |
| 개발 방식(framework) | vite |
| 데이터베이스 사용 | 아니오 |
| 배포 | GitHub → Vercel (무료) |

## 1. 데이터 모델

### 데이터 저장 방식 및 구조
- **저장소**: 브라우저 로컬 스토리지 (`LocalStorage`)
- **저장 키**: `commute_routes`, `commute_settings`

### 1. 복합 경로 목록 (`commute_routes`)
- 첫 방문 시 또는 로컬 스토리지가 비어 있을 경우, 아래의 초기 기본값(`route_1`)을 자동 삽입합니다.

```json
[
  {
    "id": "route_1",
    "name": "회사 출근길",
    "startName": "자택",
    "endName": "회사",
    "departureTime": "08:10",
    "arrivalTime": "08:55",
    "walkTimeMinutes": 7,
    "isNotificationOn": true,
    "segments": [
      {
        "type": "walk",
        "name": "도보 이동",
        "durationMinutes": 7,
        "stations": []
      },
      {
        "type": "subway",
        "name": "지하철 2호선",
        "startStation": "강남역",
        "endStation": "선릉역",
        "lineNo": "2호선",
        "stations": ["강남역", "역삼역", "선릉역"]
      },
      {
        "type": "bus",
        "name": "9000번 버스",
        "startStation": "선릉역정류소",
        "endStation": "판교테크노밸리",
        "stationName": "선릉역정류소",
        "stations": ["선릉역정류소", "한티역", "판교테크노밸리"]
      }
    ],
    "createdAt": "2026-03-30T08:00:00.000Z",
    "updatedAt": "2026-03-30T08:00:00.000Z"
  }
]
```

### 2. 실시간 도착 정보 객체 모델 (런타임 메모리 상태)
```typescript
interface TransitSegment {
  type: 'walk' | 'subway' | 'bus';
  name: string;
  startStation?: string;
  endStation?: string;
  lineNo?: string;
  stationName?: string;
  stations: string[];
}

interface TransitArrivalInfo {
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  remainingMinutes: number;
  remainingSeconds: number;
  isImminent: boolean;
  lastUpdated: string;
}
```

## 2. 기술 스택과 폴더 구조

### 기술 스택
- **프론트엔드**: Vite (React 18 + TypeScript)
- **라우팅**: `react-router-dom` v6
- **스타일링**: Tailwind CSS v3
- **아이콘**: `lucide-react`
- **배포 인프라**: GitHub → Vercel (무료 플랜)
- **데이터베이스/인증**: 미사용 (`LocalStorage` + 브라우저 `Notification` API)

### 프로젝트 파일 구조
```text
commute-transit-guide/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts               # Route, Settings, TransitArrivalInfo 타입 정의
    ├── services/
    │   ├── storage.ts             # LocalStorage CRUD (route_1 초기 seed 포함)
    │   ├── notification.ts        # Notification 권한 요청 및 알림 발송 모듈
    │   └── transitApi.ts          # 공공 API 연동 및 Mock 데이터 폴백 서비스
    ├── components/
    │   ├── Header.tsx             # 상단 네비게이션 및 새로고침 버튼
    │   ├── RouteCard.tsx          # 메인 경로 카드 컴포넌트
    │   ├── Timeline.tsx           # 정류장 및 도보 구간 타임라인 뷰
    │   └── Toast.tsx              # 에러/안내 토스트 메시지
    └── pages/
        ├── MainPage.tsx           # / (SCR-01)
        ├── SearchPage.tsx         # /search (SCR-02)
        └── DetailPage.tsx         # /route/:id (SCR-03)
```

### 환경 변수 명세
- `.env.example` 및 Vercel 환경 변수:
```bash
### 공공데이터포털 대중교통 도착정보 API Key (미설정 시 자체 Mock 데이터로 자동 동작)
VITE_PUBLIC_TRANSIT_API_KEY=
```

## 3. 품질 기준 (성능·보안·접근성)

### 품질 및 접근성 기준
- **로딩 및 성능**: 초기 접속 화면 렌더링 1.5초 이내 완료.
- **예외 핸들링**: 공공 API 네트워크 에러 발생 시 UI 상단에 `"정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요"` 토스트 노출 및 [재시도] 버튼 활성화.
- **접근성**: 모든 입력 폼(`input`)에 `aria-label` 지정, 터치 대상 버튼 크기 최소 `44px` 이상 지정.

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v14 | 2026. 10. 28. 18시 31분 16초 | 최종 감수: 최종 감수 완료: 지하철 역명 검색 시 노선번호 선택 기능, 버스 정류소명 선택 기능을 기능 명세, 화면 명세, 데이터 모델, 테스트 시나리오 전반에 일관되게 반영하고 기술/품질 기준을 확정했습니다. |
| v13 | 2026. 10. 28. 18시 31분 9초 | 지하철 역명 검색 시 노선번호 추가 선택 및 버스 정류소 검색 시 정류소명 선택 기능 반영 |
| v12 | 2026. 10. 28. 18시 27분 14초 | 버스/지하철 복합 경로 추적, 출발/도착 시각 표시, 상세 경로 내 교통수단별(버스/지하철) 구분 및 정차역 목록 표시 기능 반영 |
| v11 | 2026. 10. 28. 18시 7분 8초 | 최종 감수: 최종 감수 완료: API 키 부재 시 목(Mock) 데이터 폴백 처리 명시, 스모크 테스트 경로(/route/route_1) 호환을 위한 기본 초기 데이터 정의, 파일 트리 및 환경 변수 상세화 |
| v10 | 2026. 10. 28. 17시 42분 48초 | 최종 감수: 전체 섹션 간 데이터 모델, 화면 구성, 테스트 시나리오 및 기술 스택 일관성을 최종 감수하여 개발 가능 상태로 완전 검증하였습니다. |
| v9 | 2026. 10. 28. 17시 32분 14초 | 최종 감수: 최종 감수 완료: 모든 섹션의 일관성을 맞추고, 개발 문서로서 완벽하게 구체화함 |
| v8 | 2026. 10. 28. 17시 21분 9초 | 최종 감수: 최종 감수 완료: 모든 섹션의 일관성을 맞추고, 기술 스택과 폴더 구조, 수용 기준, 테스트 시나리오를 구체화하여 즉시 개발 가능한 상태로 완성 |
| v7 | 2026. 10. 28. 17시 17분 43초 | 출발지 대중교통 이용을 위한 '출발 타이밍 알림(푸시/브라우저 알림)' 기능 요구사항을 기능 명세 및 화면 구성에 추가 |
| v6 | 2026. 10. 28. 17시 15분 35초 | 공공 API 연동을 위한 상세 검색 방식(키워드 검색, 정류소/역 번호 직접 입력, 지도 선택) 가이드 및 관련 기능·오픈 질문 업데이트 |
| v5 | 2026. 10. 28. 17시 11분 21초 | 실시간 대중교통 API 키 관리 방식 및 도보/정류장 상세 표시 기능 요구사항을 문서에 반영하고 완성도를 높임 |
| v4 | 2026. 10. 28. 17시 10분 30초 | 출퇴근 대중교통 길잡이 서비스의 대중교통 API 연동 및 경로 관리(수정/삭제) 상세 기능 구체화 |
| v3 | 2026. 10. 28. 17시 9분 50초 | 초기 요구사항 분석을 바탕으로 문서 전반의 구체적인 명세와 검증 시나리오를 보강했습니다. |
| v2 | 2026. 10. 28. 17시 7분 45초 | 사용자 응답(로그인 없는 로컬 저장, 수도권 지역)을 반영하여 데이터 구조, 기술 스택 및 오픈 질문을 구체화함 |
| v1 | 2026. 10. 28. 17시 7분 6초 | 초기 사이트 요구사항을 바탕으로 전체 개발 문서 초안 작성 |
