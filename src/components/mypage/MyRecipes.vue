<template>
  <div class="my-recipes">
    <div class="section-header">
      <h2>내 레시피</h2>
      <button class="write-recipe-btn">
        <span class="plus-icon">+</span>
        레시피 작성
      </button>
    </div>

    <div class="recipes-grid">
      <div v-for="recipe in pagedRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image">
          <img :src="recipe.image" :alt="recipe.title" />
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-description">{{ recipe.description }}</p>
          <div class="recipe-date">{{ recipe.date }}</div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="recipes.length === 0" class="empty-state">
      <div class="empty-icon">🍳</div>
      <h3>아직 작성한 레시피가 없어요</h3>
      <p>첫 번째 레시피를 작성해보세요!</p>
      <button class="write-first-recipe-btn">
        <span class="plus-icon">+</span>
        레시피 작성하기
      </button>
    </div>
  </div>
</template>

<script>
import Pagination from './common/Pagination.vue';

export default {
  name: 'MyRecipes',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      recipesPerPage: 6,
      recipes: [
        {
          id: 1,
          title: '김치찌개',
          description: '신김치 1컵, 돼지고기 200g, 두부 반모, 대파 1대. 끓이는 시간 15분, 간 적당히.',
          image: '/src/assets/images/smu_mascort1.jpg',
          date: '2024.01.15'
        },
        {
          id: 2,
          title: '불고기',
          description: '소고기 300g, 양파 1개, 당근 반개, 간장 3스푼, 설탕 1스푼, 참기름 조금.',
          image: '/src/assets/images/smu_mascort2.jpg',
          date: '2024.01.12'
        },
        {
          id: 3,
          title: '된장찌개',
          description: '된장 2스푼, 애호박 반개, 감자 1개, 두부, 물 2컵 정도. 10분 끓이기.',
          image: '/src/assets/images/smu_mascort3.jpg',
          date: '2024.01.10'
        },
        {
          id: 4,
          title: '비빔밥',
          description: '밥, 시금치, 콩나물, 당근, 무, 고사리, 고추장 2스푼, 참기름 1스푼, 깨소금.',
          image: '/src/assets/images/smu_mascort4.jpg',
          date: '2024.01.08'
        },
        {
          id: 5,
          title: '삼겹살 구이',
          description: '삼겹살 500g, 상추, 깻잎, 마늘, 고추장. 숙성 시간 30분, 구워서 먹기.',
          image: '/src/assets/images/smu_mascort1.jpg',
          date: '2024.01.05'
        },
        {
          id: 6,
          title: '닭볶음탕',
          description: '닭고기 1kg, 감자 2개, 당근 1개, 양파 1개, 간장, 설탕, 고춧가루.',
          image: '/src/assets/images/smu_mascort2.jpg',
          date: '2024.01.03'
        },
        {
          id: 7,
          title: '된장국',
          description: '된장 3스푼, 애호박, 두부, 파, 마늘, 참기름. 끓이는 시간 10분.',
          image: '/src/assets/images/smu_mascort3.jpg',
          date: '2024.01.01'
        },
        {
          id: 8,
          title: '김밥',
          description: '밥, 김, 단무지, 당근, 오이, 계란, 햄, 참기름, 깨소금.',
          image: '/src/assets/images/smu_mascort4.jpg',
          date: '2023.12.30'
        },
        {
          id: 9,
          title: '떡볶이',
          description: '떡볶이 떡, 어묵, 고추장, 고춧가루, 설탕, 간장. 끓이는 시간 15분.',
          image: '/src/assets/images/smu_mascort1.jpg',
          date: '2023.12.28'
        },
        {
          id: 10,
          title: '순두부찌개',
          description: '순두부 1팩, 돼지고기 100g, 양파, 대파, 고추장, 고춧가루.',
          image: '/src/assets/images/smu_mascort2.jpg',
          date: '2023.12.25'
        }
      ]
    };
  },
  computed: {
    pagedRecipes() {
      const start = (this.currentPage - 1) * this.recipesPerPage;
      const end = start + this.recipesPerPage;
      return this.recipes.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.recipes.length / this.recipesPerPage);
    },

  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
};
</script>

<style scoped>
.my-recipes {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.write-recipe-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-recipe-btn:hover {
  background: #e66a00;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  padding: 16px;
}

.recipe-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.recipe-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-date {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
  display: block;
  text-align: center;
  margin-top: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #444;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 32px 0;
  color: #666;
}

.write-first-recipe-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-first-recipe-btn:hover {
  background: #e66a00;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .write-recipe-btn {
    justify-content: center;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 