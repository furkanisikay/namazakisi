/**
 * Error Boundary component for catching render errors
 * Wraps around components to catch and log React render errors
 * with detailed component stack information
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Logger } from '../../../core/utils/Logger';

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
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scroll}>
                        <Text style={styles.title}>Bir hata olustu</Text>
                        <Text style={styles.errorMessage}>
                            {this.state.error?.message}
                        </Text>

                        {this.state.errorInfo?.componentStack && (
                            <View style={styles.stackContainer}>
                                <Text style={styles.stackTitle}>Component Stack:</Text>
                                <Text style={styles.stackText}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                            <Text style={styles.retryText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        padding: 20,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#e94560',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    errorMessage: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    stackContainer: {
        backgroundColor: '#16213e',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    stackTitle: {
        color: '#e94560',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stackText: {
        color: '#a0a0a0',
        fontSize: 11,
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    retryButton: {
        backgroundColor: '#e94560',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    retryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorBoundary;
