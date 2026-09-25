/**
 * Bản đồ OpenLayers.
 * - Khởi tạo Map đúng 1 lần (useEffect + useRef) và hủy khi component unmount.
 * - Đồng bộ dữ liệu: atom (GeoJSON 4326) -> VectorSource (ol/Feature 3857).
 * - Thêm/bớt interaction theo chế độ: Draw (vẽ mới), Modify (sửa đỉnh), Snap (bắt điểm).
 * - Click chọn đối tượng; "bay" tới đối tượng khi chọn từ danh sách.
 */
import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import 'ol/ol.css';
import OlMap from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Collection from 'ol/Collection.js';
import Draw from 'ol/interaction/Draw.js';
import Modify from 'ol/interaction/Modify.js';
import Snap from 'ol/interaction/Snap.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import { fromLonLat } from 'ol/proj.js';
import { Fill, Stroke, Style, Text } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle.js';
import { CATEGORIES } from '../../shared/constants.js';
import { DRAFT_ID, toGeoJSONGeometry, toOlFeature } from '../utils/geo.js';
import {
  draftFeatureAtom,
  editModeAtom,
  editingFeatureAtom,
  focusRequestAtom,
  panelTabAtom,
  selectedFeatureIdAtom,
  visibleFeaturesAtom,
} from '../store/atoms.js';

const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.color]));
const HIGHLIGHT = '#d32f2f';

function hexToRgba(hex, alpha) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function createStyle(feature, highlightId) {
  const color = CATEGORY_COLORS[feature.get('category')] ?? '#546e7a';
  const active = feature.getId() === highlightId || feature.getId() === DRAFT_ID;
  return new Style({
    fill: new Fill({ color: hexToRgba(color, active ? 0.45 : 0.25) }),
    stroke: new Stroke({ color: active ? HIGHLIGHT : color, width: active ? 3 : 2, lineDash: feature.getId() === DRAFT_ID ? [8, 6] : undefined }),
    image: new CircleStyle({
      radius: active ? 8 : 6,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: active ? HIGHLIGHT : '#ffffff', width: 2 }),
    }),
    text: new Text({
      text: feature.get('name') || '',
      offsetY: feature.getGeometry()?.getType() === 'Point' ? -16 : 0,
      font: '12px Roboto, Arial, sans-serif',
      fill: new Fill({ color: '#212121' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
      overflow: true,
    }),
  });
}

export default function MapView() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const sourceRef = useRef(null);
  const layerRef = useRef(null);

  const visibleFeatures = useAtomValue(visibleFeaturesAtom);
  const [draft, setDraft] = useAtom(draftFeatureAtom);
  const [selectedId, setSelectedId] = useAtom(selectedFeatureIdAtom);
  const [mode, setMode] = useAtom(editModeAtom);
  const editingFeature = useAtomValue(editingFeatureAtom);
  const focusRequest = useAtomValue(focusRequestAtom);
  const setTab = useSetAtom(panelTabAtom);

  // id của ol/Feature đang được chỉnh sửa / tô sáng
  const highlightId = draft ? draft.id ?? DRAFT_ID : selectedId;

  // Ref giữ giá trị mới nhất cho các handler đăng ký một lần (tránh "stale closure")
  const latest = useRef({});
  latest.current = { mode, draft, highlightId, editingFeature };

  // 1) Khởi tạo bản đồ
  useEffect(() => {
    const source = new VectorSource();
    const layer = new VectorLayer({
      source,
      style: (feature) => createStyle(feature, latest.current.highlightId),
    });
    const map = new OlMap({
      target: containerRef.current,
      layers: [new TileLayer({ source: new OSM() }), layer],
      view: new View({ center: fromLonLat([105.779, 21.024]), zoom: 15 }),
      controls: defaultControls().extend([
        new ScaleLine(),
        new MousePosition({
          coordinateFormat: createStringXY(6),
          projection: 'EPSG:4326',
          className: 'mouse-position',
        }),
      ]),
    });

    // Click chọn đối tượng (chỉ ở chế độ select)
    map.on('singleclick', (event) => {
      if (latest.current.mode !== 'select') return;
      const hit = map.forEachFeatureAtPixel(event.pixel, (f) => f, { hitTolerance: 5 });
      if (hit && hit.getId() !== DRAFT_ID) {
        setDraft(null);
        setSelectedId(hit.getId());
        setTab('form');
      } else if (!hit && !latest.current.draft) {
        setSelectedId(null);
      }
    });
    // Đổi con trỏ chuột khi rê lên đối tượng
    map.on('pointermove', (event) => {
      if (event.dragging || latest.current.mode !== 'select') return;
      const hasFeature = map.hasFeatureAtPixel(event.pixel, { hitTolerance: 5 });
      map.getTargetElement().style.cursor = hasFeature ? 'pointer' : '';
    });

    mapRef.current = map;
    sourceRef.current = source;
    layerRef.current = layer;
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [setDraft, setSelectedId, setTab]);

  // 2) Đồng bộ dữ liệu từ atom sang VectorSource
  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    const list = visibleFeatures.map((f) => (draft && draft.id === f.id ? draft : f));
    if (draft && !draft.id) list.push(draft);
    source.clear(true);
    source.addFeatures(list.map(toOlFeature));
  }, [visibleFeatures, draft]);

  // 3) Vẽ lại style khi thay đổi đối tượng được chọn
  useEffect(() => {
    layerRef.current?.changed();
  }, [highlightId]);

  // 4) Thêm interaction theo chế độ thao tác
  useEffect(() => {
    const map = mapRef.current;
    const source = sourceRef.current;
    if (!map || !source) return undefined;
    const interactions = [];
    const cleanups = [];

    if (mode.startsWith('draw-')) {
      const draw = new Draw({ type: mode.replace('draw-', '') });
      draw.on('drawend', (event) => {
        setSelectedId(null);
        setDraft({
          type: 'Feature',
          id: null,
          clientKey: Date.now(),
          geometry: toGeoJSONGeometry(event.feature.getGeometry()),
          properties: { name: '', category: '', status: 'draft', description: '', attributes: [] },
        });
        setMode('select');
        setTab('form');
      });
      const onKeyDown = (e) => {
        if (e.key === 'Escape') draw.abortDrawing();
      };
      window.addEventListener('keydown', onKeyDown);
      cleanups.push(() => window.removeEventListener('keydown', onKeyDown));
      interactions.push(draw);
    }

    if (mode === 'modify' && highlightId) {
      const target = source.getFeatureById(highlightId);
      if (target) {
        const modify = new Modify({ features: new Collection([target]) });
        modify.on('modifyend', () => {
          const base = latest.current.draft ?? latest.current.editingFeature;
          if (!base) return;
          setDraft({ ...base, geometry: toGeoJSONGeometry(target.getGeometry()) });
        });
        interactions.push(modify);
      }
    }

    // Snap phải được thêm SAU Draw/Modify
    if (interactions.length > 0) interactions.push(new Snap({ source }));

    interactions.forEach((i) => map.addInteraction(i));
    return () => {
      interactions.forEach((i) => map.removeInteraction(i));
      cleanups.forEach((fn) => fn());
    };
    // visibleFeatures/draft: source được dựng lại nên phải gắn Modify vào ol/Feature mới
  }, [mode, highlightId, visibleFeatures, draft, setDraft, setMode, setSelectedId, setTab]);

  // 5) Bay tới đối tượng khi được yêu cầu (chọn từ danh sách)
  useEffect(() => {
    if (!focusRequest || !mapRef.current) return;
    const olFeature = sourceRef.current.getFeatureById(focusRequest.id);
    if (!olFeature) return;
    mapRef.current.getView().fit(olFeature.getGeometry().getExtent(), {
      padding: [80, 80, 80, 80],
      maxZoom: 18,
      duration: 600,
    });
  }, [focusRequest]);

  return <div ref={containerRef} className="map-container" data-testid="map" />;
}
