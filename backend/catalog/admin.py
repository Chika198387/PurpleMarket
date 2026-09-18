from django.contrib import admin

# Register your models here.

# catalog/admin.py
from django.contrib import admin
from .models import Category, Product, Favorite, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'in_stock', 'is_hit', 'is_new']
    list_filter = ['category', 'in_stock', 'is_hit', 'is_new']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'user', 'rating', 'created_at']

admin.site.register(Favorite)