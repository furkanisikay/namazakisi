/**
 * Error Boundary component for catching render errors
 * Wraps around components to catch and log React render errors
 * with detailed component stack information
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Logger } from '../../../core/utils/Logger';
import { TemaContext } from '../../../core/theme/TemaContext';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    /** Unique name to identify which boundary caught the error */
    name?: string;
}

/**
 * React Error Boundary for catching and logging render errors.
 * Provides detailed component stack information for debugging.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const boundaryName = this.props.name || 'ErrorBoundary';

        // Log full error details with component stack
        Logger.error(boundaryName, `YAKALANDI: ${error.message}`, {
            errorName: error.name,
            errorMessage: error.message,
        });

        // Full JS call stack — 2000 karakter ile sinirlandir (AsyncStorage boyut limitini asmasin)
        if (error.stack) {
            Logger.error(boundaryName, `JS STACK TRACE:\n${error.stack.slice(0, 2000)}`);
        }

        // Component stack is the most important piece for debugging
        const componentStack = (errorInfo.componentStack ?? '').slice(0, 2000);
        Logger.error(boundaryName, `COMPONENT STACK:\n${componentStack}`);

        this.setState({ errorInfo });
    }

    private handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <TemaContext.Consumer>
                    {(temaContext) => {
                        const { tema } = temaContext;
                        const renkler = tema.renkler;

                        return (
                            <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
                                <ScrollView contentContainerStyle={styles.scroll}>
                                    <Text style={[styles.title, { color: renkler.durum.hata }]}>Bir hata olustu</Text>
                                    <Text style={[styles.errorMessage, { color: renkler.metin }]}>
                                        {this.state.error?.message}
                                    </Text>

                                    {this.state.errorInfo?.componentStack && (
                                        <View style={[styles.stackContainer, { backgroundColor: renkler.kartArkaplan }]}>
                                            <Text style={[styles.stackTitle, { color: renkler.durum.hata }]}>Component Stack:</Text>
                                            <Text style={[styles.stackText, { color: renkler.metinIkincil }]}>
                                                {this.state.errorInfo.componentStack}
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.retryButton, { backgroundColor: renkler.durum.hata }]}
                                        onPress={this.handleRetry}
                                        accessibilityRole="button"
                                        accessibilityLabel="Tekrar Dene"
                                    >
                                        {/* Hata butonu zemin rengi üzerinde açık temada kartArkaplan (beyaz)
                                            koyu temada ise arkaplan kullanarak okunaklılık sağlanır */}
                                        <Text style={[styles.retryText, { color: tema.mod === 'acik' ? renkler.kartArkaplan : renkler.arkaplan }]}>Tekrar Dene</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        );
                    }}
                </TemaContext.Consumer>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    errorMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    stackContainer: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    stackTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stackText: {
        fontSize: 11,
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    retryButton: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    retryText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorBoundary;
