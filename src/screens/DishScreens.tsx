import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Button, ConfirmDialog, Field, styles } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Dish, DishImage, FilterState } from '../types/models';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function DishListScreen({ navigation }: any) {
  const { dishes, categories, filters, setFilters, online, pendingChanges, t } = useApp();
  const visible = useMemo(() => dishes.filter(d => {
    const q = filters.query.trim().toLocaleLowerCase(); const priceOk = (!filters.minPrice || d.BIT240020_Price >= Number(filters.minPrice)) && (!filters.maxPrice || d.BIT240020_Price <= Number(filters.maxPrice));
    return (!q || d.BIT240020_Name.toLocaleLowerCase().includes(q)) && (!filters.categoryId || d.BIT240020_DishCategoryId === filters.categoryId) && (!filters.onlyAvailable || d.BIT240020_IsAvailable) && priceOk;
  }).sort((a, b) => filters.sort === 'priceAsc' ? a.BIT240020_Price - b.BIT240020_Price : filters.sort === 'priceDesc' ? b.BIT240020_Price - a.BIT240020_Price : a.BIT240020_PreparationTime - b.BIT240020_PreparationTime), [dishes, filters]);
  const categoryName = (id: string) => categories.find(c => c.BIT240020_Id === id)?.BIT240020_Name ?? '-';
  return <View style={styles.page}>
    <View style={styles.row}><View style={{ flex: 1 }}><Field label="" placeholder={t('search')} value={filters.query} onChangeText={query => setFilters({ ...filters, query })} /></View><Pressable onPress={() => navigation.navigate('Filters')}><Text style={styles.chip}>{t('filters')}</Text></Pressable></View>
    <Text style={[styles.sub, { marginBottom: 8 }]}>{online && !pendingChanges.length ? t('synced') : t('offline')}</Text>
    <FlatList data={visible} keyExtractor={d => d.BIT240020_Id} contentContainerStyle={{ paddingBottom: 18 }} ListEmptyComponent={<Text style={styles.sub}>{t('noDishes')}</Text>} renderItem={({ item }) => <Pressable onPress={() => navigation.navigate('DishDetails', { id: item.BIT240020_Id })} style={styles.card}>
      <View style={styles.spread}><View style={{ flex: 1 }}><Text style={styles.title}>{item.BIT240020_Name}</Text><Text style={styles.sub}>{categoryName(item.BIT240020_DishCategoryId)} · {item.BIT240020_Price.toLocaleString()} ₫</Text><Text style={styles.sub}>{item.BIT240020_PreparationTime} min · {item.BIT240020_PreparationTime <= 15 ? t('quick') : t('regular')} · {item.BIT240020_IsAvailable ? '✓' : '○'}</Text></View>{item.BIT240020_DishImage.find(x => x.BIT240020_IsThumbnail)?.BIT240020_ImageUrl ? <Image source={{ uri: item.BIT240020_DishImage.find(x => x.BIT240020_IsThumbnail)?.BIT240020_ImageUrl }} style={{ width: 68, height: 68, borderRadius: 8 }} /> : null}</View>
    </Pressable>} />
    <Button title={t('addDish')} onPress={() => navigation.navigate('DishForm')} />
  </View>;
}

export function FilterScreen({ navigation }: any) {
  const { filters, setFilters, categories, t } = useApp(); const [draft, setDraft] = useState<FilterState>(filters); const [rangeError, setRangeError] = useState('');
  const apply = () => { if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) return setRangeError(t('invalidPriceRange')); setFilters(draft); navigation.goBack(); };
  return <ScrollView style={styles.page}><Text style={styles.label}>{t('category')}</Text><Button title={draft.categoryId ? categories.find(x => x.BIT240020_Id === draft.categoryId)?.BIT240020_Name ?? t('allCategories') : t('allCategories')} type="neutral" onPress={() => { const next = draft.categoryId ? undefined : categories[0]?.BIT240020_Id; setDraft({ ...draft, categoryId: next }); }} />
    {categories.map(c => <Pressable key={c.BIT240020_Id} onPress={() => setDraft({ ...draft, categoryId: c.BIT240020_Id })}><Text style={[styles.chip, { marginTop: 7, alignSelf: 'flex-start' }]}>{c.BIT240020_Name}{draft.categoryId === c.BIT240020_Id ? ' ✓' : ''}</Text></Pressable>)}
    <View style={[styles.spread, { marginTop: 16 }]}><Text style={styles.label}>{t('onlyAvailable')}</Text><Switch value={draft.onlyAvailable} onValueChange={onlyAvailable => setDraft({ ...draft, onlyAvailable })} /></View>
    <Field label={t('minPrice')} value={draft.minPrice} onChangeText={minPrice => setDraft({ ...draft, minPrice })} keyboardType="decimal-pad" error={rangeError} /><Field label={t('maxPrice')} value={draft.maxPrice} onChangeText={maxPrice => setDraft({ ...draft, maxPrice })} keyboardType="decimal-pad" />
    {(['priceAsc', 'priceDesc', 'timeAsc'] as const).map(sort => <Pressable key={sort} onPress={() => setDraft({ ...draft, sort })} style={styles.card}><Text>{draft.sort === sort ? '●' : '○'} {sort === 'priceAsc' ? t('priceLow') : sort === 'priceDesc' ? t('priceHigh') : t('timeShort')}</Text></Pressable>)}
    <Button title={t('apply')} onPress={apply} /><Button title={t('clear')} type="neutral" onPress={() => setDraft({ query: filters.query, onlyAvailable: false, minPrice: '', maxPrice: '', sort: 'priceAsc' })} />
  </ScrollView>;
}

export function DishDetailsScreen({ route, navigation }: any) {
  const { dishes, categories, deleteDish, t } = useApp(); const dish = dishes.find(d => d.BIT240020_Id === route.params.id);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  if (!dish) return <View style={styles.page}><Text>{t('noDishes')}</Text></View>;
  const remove = () => setDeleteDialogVisible(true);
  const confirmDelete = () => { setDeleteDialogVisible(false); deleteDish(dish.BIT240020_Id); navigation.goBack(); };
  return <View style={{ flex: 1 }}><ScrollView style={styles.page}><Text style={styles.title}>{dish.BIT240020_Name}</Text><Text style={styles.sub}>{categories.find(c => c.BIT240020_Id === dish.BIT240020_DishCategoryId)?.BIT240020_Name}</Text><Text style={[styles.sub, { marginTop: 12 }]}>{dish.BIT240020_Description || '-'}</Text><Text style={[styles.title, { marginTop: 16 }]}>{dish.BIT240020_Price.toLocaleString()} ₫</Text><Text style={styles.sub}>{dish.BIT240020_PreparationTime} min · {dish.BIT240020_PreparationTime <= 15 ? t('quick') : t('regular')} · {dish.BIT240020_IsAvailable ? t('available') : t('unavailable')}</Text>
    <Text style={[styles.label, { marginTop: 20 }]}>{t('images')}</Text>{dish.BIT240020_DishImage.length ? dish.BIT240020_DishImage.map((image, index) => <View key={`${image.BIT240020_ImageUrl}-${index}`} style={{ marginBottom: 14 }}><Image source={{ uri: image.BIT240020_ImageUrl }} style={{ width: '100%', height: 210, borderRadius: 10 }} /><Text style={styles.sub}>{image.BIT240020_IsThumbnail ? t('thumbnail') : ''}</Text></View>) : <Text style={styles.sub}>{t('noImages')}</Text>}
    <Button title={t('edit')} onPress={() => navigation.navigate('DishForm', { id: dish.BIT240020_Id })} /><Button title={t('delete')} type="danger" onPress={remove} />
  </ScrollView><ConfirmDialog visible={isDeleteDialogVisible} title={t('delete')} message={t('confirmDelete')} cancelLabel={t('cancel')} confirmLabel={t('delete')} onCancel={() => setDeleteDialogVisible(false)} onConfirm={confirmDelete} /></View>;
}

export function DishFormScreen({ route, navigation }: any) {
  const { dishes, categories, addDish, updateDish, t } = useApp(); const existing = dishes.find(d => d.BIT240020_Id === route.params?.id);
  const [form, setForm] = useState<Dish>(existing ?? { BIT240020_Id: uid(), BIT240020_Name: '', BIT240020_Price: 0, BIT240020_PreparationTime: 0, BIT240020_IsAvailable: true, BIT240020_Description: '', BIT240020_DishCategoryId: categories[0]?.BIT240020_Id ?? '', BIT240020_DishImage: [], BIT240020_UpdatedAt: new Date().toISOString() });
  const [errors, setErrors] = useState<Record<string, string>>({}); const [newUrl, setNewUrl] = useState('');
  const submit = () => { const e: Record<string, string> = {}; if (!form.BIT240020_Name.trim()) e.name = t('required'); if (!(form.BIT240020_Price > 0)) e.price = t('positive'); if (!(form.BIT240020_PreparationTime > 0)) e.time = t('positive'); if (!form.BIT240020_DishCategoryId) e.category = t('required'); if (dishes.some(d => d.BIT240020_Id !== form.BIT240020_Id && d.BIT240020_DishCategoryId === form.BIT240020_DishCategoryId && d.BIT240020_Name.trim().toLowerCase() === form.BIT240020_Name.trim().toLowerCase())) e.name = t('duplicate'); setErrors(e); if (Object.keys(e).length) return; const saved = { ...form, BIT240020_Name: form.BIT240020_Name.trim(), BIT240020_UpdatedAt: new Date().toISOString() }; existing ? updateDish(saved) : addDish(saved); navigation.goBack(); };
  const addImage = () => { if (!newUrl.trim()) return; const next: DishImage = { BIT240020_ImageUrl: newUrl.trim(), BIT240020_IsThumbnail: !form.BIT240020_DishImage.some(x => x.BIT240020_IsThumbnail) }; setForm({ ...form, BIT240020_DishImage: [...form.BIT240020_DishImage, next] }); setNewUrl(''); };
  return <ScrollView style={styles.page}><Field label={t('name')} value={form.BIT240020_Name} onChangeText={BIT240020_Name => setForm({ ...form, BIT240020_Name })} error={errors.name} /><Field label={t('description')} value={form.BIT240020_Description} onChangeText={BIT240020_Description => setForm({ ...form, BIT240020_Description })} multiline /><Field label={t('price')} value={form.BIT240020_Price ? String(form.BIT240020_Price) : ''} onChangeText={x => setForm({ ...form, BIT240020_Price: Number(x) })} keyboardType="decimal-pad" error={errors.price} /><Field label={t('minutes')} value={form.BIT240020_PreparationTime ? String(form.BIT240020_PreparationTime) : ''} onChangeText={x => setForm({ ...form, BIT240020_PreparationTime: Number(x) })} keyboardType="number-pad" error={errors.time} />
    <Text style={styles.label}>{t('category')}</Text>{categories.map(c => <Pressable key={c.BIT240020_Id} onPress={() => setForm({ ...form, BIT240020_DishCategoryId: c.BIT240020_Id })} style={styles.card}><Text>{form.BIT240020_DishCategoryId === c.BIT240020_Id ? '●' : '○'} {c.BIT240020_Name}</Text></Pressable>)}{errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
    <View style={styles.spread}><Text style={styles.label}>{t('available')}</Text><Switch value={form.BIT240020_IsAvailable} onValueChange={BIT240020_IsAvailable => setForm({ ...form, BIT240020_IsAvailable })} /></View><Text style={styles.label}>{t('images')}</Text><Field label={t('imageUrl')} value={newUrl} onChangeText={setNewUrl} placeholder="https://..." /><Button title={t('addImage')} type="neutral" onPress={addImage} />
    {form.BIT240020_DishImage.map((x, i) => <View key={`${x.BIT240020_ImageUrl}-${i}`} style={styles.card}><Text numberOfLines={1}>{x.BIT240020_ImageUrl}</Text><View style={styles.row}><Pressable onPress={() => setForm({ ...form, BIT240020_DishImage: form.BIT240020_DishImage.map((img, index) => ({ ...img, BIT240020_IsThumbnail: index === i })) })}><Text style={styles.chip}>{x.BIT240020_IsThumbnail ? `✓ ${t('thumbnail')}` : t('thumbnail')}</Text></Pressable><Pressable onPress={() => setForm({ ...form, BIT240020_DishImage: form.BIT240020_DishImage.filter((_, index) => index !== i) })}><Text style={[styles.error, { marginLeft: 8 }]}>{t('delete')}</Text></Pressable></View></View>)}
    <Button title={t('save')} onPress={submit} />
  </ScrollView>;
}
