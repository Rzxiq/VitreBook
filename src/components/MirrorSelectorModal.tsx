import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { MirrorConfig } from '../types/book';

interface MirrorSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MirrorSelectorModal: React.FC<MirrorSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { mirrors, activeMirrorId, setActiveMirror, addCustomMirror } = useSettingsStore();
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelect = (mirrorId: string) => {
    setActiveMirror(mirrorId);
    onClose();
  };

  const handleAddCustom = () => {
    if (!customUrl.trim()) return;
    const cleanUrl = customUrl.trim().replace(/\/$/, '');
    const newMirror: MirrorConfig = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || cleanUrl.replace(/^https?:\/\//, ''),
      baseUrl: cleanUrl,
      searchPath: '/search.php',
      resolverUrlTemplate: 'https://library.lol/main/{MD5}',
      isActive: true,
    };
    addCustomMirror(newMirror);
    setCustomName('');
    setCustomUrl('');
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Select Catalog Mirror</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={mirrors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isActive = item.id === activeMirrorId;
              return (
                <TouchableOpacity
                  style={[styles.mirrorItem, isActive && styles.activeItem]}
                  onPress={() => handleSelect(item.id)}
                >
                  <View>
                    <Text style={[styles.mirrorName, isActive && styles.activeText]}>
                      {item.name}
                    </Text>
                    <Text style={styles.mirrorUrl}>{item.baseUrl}</Text>
                  </View>
                  {isActive && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />

          {showAddForm ? (
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Mirror Name (e.g. Libgen.gs)"
                placeholderTextColor="#777"
                value={customName}
                onChangeText={setCustomName}
                style={styles.input}
              />
              <TextInput
                placeholder="Base URL (e.g. https://libgen.gs)"
                placeholderTextColor="#777"
                value={customUrl}
                onChangeText={setCustomUrl}
                autoCapitalize="none"
                style={styles.input}
              />
              <View style={styles.formButtonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelBtn]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveBtn]}
                  onPress={handleAddCustom}
                >
                  <Text style={[styles.buttonText, { color: '#FFF' }]}>Save Mirror</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addCustomBtn}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addCustomText}>+ Add Custom Domain</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#8E8E93',
    fontSize: 18,
  },
  mirrorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
    marginBottom: 10,
  },
  activeItem: {
    backgroundColor: '#3A3A3C',
    borderColor: '#E50914',
    borderWidth: 1,
  },
  mirrorName: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
  },
  mirrorUrl: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  activeText: {
    color: '#FFF',
  },
  checkMark: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addCustomBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCustomText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#262626',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#3A3A3C',
  },
  saveBtn: {
    backgroundColor: '#E50914',
  },
  buttonText: {
    fontWeight: '600',
    color: '#AAA',
  },
});
