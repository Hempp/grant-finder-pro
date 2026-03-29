"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Modal, ModalContent, ModalFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Confetti } from "./Confetti";

interface SuccessModalProps {
  show: boolean;
  grantTitle: string;
  applicationId: string;
  onClose: () => void;
}

export function SuccessModal({ show, grantTitle, applicationId, onClose }: SuccessModalProps) {
  return (
    <>
      <Confetti show={show} />
      <Modal isOpen={show} onClose={onClose}>
        <ModalContent className="text-center p-8">
          <div className="bg-emerald-500/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-400 text-sm leading-5">
            &ldquo;{grantTitle}&rdquo; has been submitted. We&apos;ll track the outcome and notify you.
          </p>
        </ModalContent>
        <ModalFooter className="justify-center gap-3">
          <Link href={`/dashboard/applications/${applicationId}`}>
            <Button variant="outline" size="sm">
              Track Application
            </Button>
          </Link>
          <Link href="/dashboard/grants">
            <Button variant="primary" size="sm">
              Apply to Another
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </ModalFooter>
      </Modal>
    </>
  );
}
