import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, ConfirmDialog, Field, styles } from '../components/UI';
import { useApp } from '../context/AppContext';
import { DishCategory } from '../types/models';
const uid = () => `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function CategoriesScreen({ navigation }: any) {
  const { categories, dishes, deleteCategory, t } = useApp();
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null); const [notice, setNotice] = useState('');
  const remove = (id: string) => { if (dishes.some(d => d.BIT240020_DishCategoryId === id)) return setNotice(t('cannotDeleteCategory')); setNotice(''); setCategoryIdToDelete(id); };
  const confirmDelete = () => { if (categoryIdToDelete) deleteCategory(categoryIdToDelete); setCategoryIdToDelete(null); };
  return <View style={styles.page}>{notice ? <Text style={[styles.error, { marginBottom: 8 }]}>{notice}</Text> : null}<FlatList data={categories} keyExtractor={c => c.BIT240020_Id} renderItem={({ item }) => <View style={styles.card}><View style={styles.spread}><View><Text style={styles.title}>{item.BIT240020_Name}</Text><Text style={styles.sub}>{item.BIT240020_Description}</Text><Text style={styles.sub}>{dishes.filter(d => d.BIT240020_DishCategoryId === item.BIT240020_Id).length} {t('dishes').toLowerCase()}</Text></View><View><Pressable onPress={() => navigation.navigate('CategoryForm', { id: item.BIT240020_Id })}><Text style={styles.chip}>{t('edit')}</Text></Pressable><Pressable onPress={() => remove(item.BIT240020_Id)}><Text style={[styles.error, { marginTop: 12 }]}>{t('delete')}</Text></Pressable></View></View></View>} /><Button title={t('addCategory')} onPress={() => navigation.navigate('CategoryForm')} /><ConfirmDialog visible={Boolean(categoryIdToDelete)} title={t('delete')} message={t('confirmDeleteCategory')} cancelLabel={t('cancel')} confirmLabel={t('delete')} onCancel={() => setCategoryIdToDelete(null)} onConfirm={confirmDelete} /></View>;
}
export function CategoryFormScreen({ route, navigation }: any) {
  const { categories, addCategory, updateCategory, t } = useApp(); const old = categories.find(x => x.BIT240020_Id === route.params?.id); const [category, setCategory] = useState<DishCategory>(old ?? { BIT240020_Id: uid(), BIT240020_Name: '', BIT240020_Description: '', BIT240020_UpdatedAt: new Date().toISOString() }); const [error, setError] = useState('');
  const save = () => { if (!category.BIT240020_Name.trim()) return setError(t('required')); const value = { ...category, BIT240020_Name: category.BIT240020_Name.trim(), BIT240020_UpdatedAt: new Date().toISOString() }; old ? updateCategory(value) : addCategory(value); navigation.goBack(); };
  return <ScrollView style={styles.page}><Field label={t('name')} value={category.BIT240020_Name} onChangeText={BIT240020_Name => setCategory({ ...category, BIT240020_Name })} error={error} /><Field label={t('description')} value={category.BIT240020_Description} onChangeText={BIT240020_Description => setCategory({ ...category, BIT240020_Description })} multiline /><Button title={t('save')} onPress={save} /></ScrollView>;
}
