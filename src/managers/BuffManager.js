class BuffManager {
  constructor() {
    this.activeBuffs = [];
    this.nextBuffId = 1;
  }

  // 버프 추가
  addBuff(buffData) {
    const buff = {
      id: this.nextBuffId++,
      type: buffData.type,        // 'community', 'regular', 'milestone', 'rating'
      category: buffData.category, // 'positive', 'negative', 'neutral'
      name: buffData.name,
      description: buffData.description,
      icon: buffData.icon,
      value: buffData.value || 0,
      startDay: buffData.startDay,
      duration: buffData.duration,  // -1이면 영구
      expiryDay: buffData.duration === -1 ? -1 : buffData.startDay + buffData.duration,
      source: buffData.source,
      stackable: buffData.stackable || false
    };

    this.activeBuffs.push(buff);
    console.log('✅ 버프 추가:', buff.name);
    return buff;
  }

  // 만료된 버프 제거
  checkExpiry(currentDay) {
    const expired = this.activeBuffs.filter(b => b.expiryDay !== -1 && b.expiryDay <= currentDay);
    this.activeBuffs = this.activeBuffs.filter(b => b.expiryDay === -1 || b.expiryDay > currentDay);

    if (expired.length > 0) {
      console.log('⏰ 버프 만료:', expired.map(b => b.name));
    }

    return expired;
  }

  // 특정 타입의 버프 가져오기
  getBuffsByType(type) {
    return this.activeBuffs.filter(b => b.type === type);
  }

  // 카테고리별 버프 가져오기
  getBuffsByCategory(category) {
    return this.activeBuffs.filter(b => b.category === category);
  }

  // 모든 활성 버프
  getActiveBuffs() {
    return [...this.activeBuffs];
  }

  // 특정 소스의 버프 제거
  removeBuffsBySource(source) {
    const removed = this.activeBuffs.filter(b => b.source === source);
    this.activeBuffs = this.activeBuffs.filter(b => b.source !== source);

    if (removed.length > 0) {
      console.log('🗑️ 버프 제거:', removed.map(b => b.name));
    }

    return removed;
  }

  // 버프 ID로 제거
  removeBuffById(buffId) {
    const buff = this.activeBuffs.find(b => b.id === buffId);
    this.activeBuffs = this.activeBuffs.filter(b => b.id !== buffId);

    if (buff) {
      console.log('🗑️ 버프 제거:', buff.name);
    }

    return buff;
  }

  // 특정 타입의 총 value 계산
  getTotalValue(type) {
    return this.activeBuffs
      .filter(b => b.type === type)
      .reduce((sum, b) => sum + (b.value || 0), 0);
  }

  // 버프 존재 여부 확인
  hasBuff(source) {
    return this.activeBuffs.some(b => b.source === source);
  }

  // 모든 버프 초기화
  clearAll() {
    this.activeBuffs = [];
    this.nextBuffId = 1;
    console.log('🧹 모든 버프 초기화');
  }
}

export default BuffManager;
